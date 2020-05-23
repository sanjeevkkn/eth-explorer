// Transaction Service
var transactionService = {    

    getTransaction : function(req, res){
       var txId = req.params.txId;
       
        web3.eth.getTransaction(txId, function(err, transaction){
           if(err){
               console.log("Some error occurred..!!!");
               console.log(err);
               res.json(err);
           }
           else{
               if(transaction){
                    web3.eth.getTransactionReceipt(txId, function(err, receipt){
                        if(err){
                            console.log("Some error occurred..!!!");
                            console.log(err);
                            res.json(err);
                        }
                        else{
                            createResponse(transaction, receipt, res);
                        }
                    });
                }
                else{
                    res.json("No Transaction found...!!! Please ensure the correct Chain is configured in 'serverConfig.js'");
                }               
           }
       });       
    }    
}

function createResponse(transaction, receipt, res){     
    
    if(transaction.to){
        // Not Contract creation transaction.
        web3.eth.getCode(transaction.to, function(err,code){
            if(err){
                console.log("Some error occurred..!!!");
                console.log(err);
                res.json(err);
            }
            else {
                if(code == '0x'){
                    // Account transfer - To addressess should not be a contract.
                    var result = createAccountTransferResponse(transaction, receipt);
                    res.json(result);
                }
                else {                                           
                    if(transaction.input){
                        var hexFunction = transaction.input.substring(2, 10);
                        if(hexFunction == web3.sha3('transfer(address,uint256)').substring(2, 10)){
                            // ERC 20 token transfer.
                            var result = createERC20Response(transaction, receipt);
                            res.json(result);
                        }
                        else{
                            // Contract Execution.
                            var result = createContractResponse(transaction, receipt);
                            res.json(result);
                        }
                    }
                    
                }
            }
            
        });
    }
    else{
        // Other Transaction.
        res.json('Other transaction response - Not Implemented...!!!');
    }
}

function createAccountTransferResponse(transaction, receipt){

    var result = {  
        "block":{  
           "blockHeight":transaction.blockNumber
        },
        "outs":[  
           {  
              "address": transaction.to,
              "value": transaction.value
           }
        ],
        "ins":[  
           {  
              "address": transaction.from,
              "value": "-" + transaction.value
           }
        ],
        "hash": transaction.hash,
        "currency":"ETH",
        "chain": "ETH.main",
        "state": receipt.status == '0x1'? 'confirmed':'pending',
        "depositType":"account"
     }
     
    return result;
}

function createERC20Response(transaction, receipt){

    var result = {  
        "block":{  
           "blockHeight":transaction.blockNumber
        },
        "outs":[  
           {  
              "address": getToAddress(transaction.input),
              "value": getTokenQty(transaction.input),
              "type": "token",
              "coinspecific": {
                  "tokenAddress": transaction.to
              }
  
           }
        ],
        "ins":[  
           {  
              "address": transaction.from,
              "value": "-" + getTokenQty(transaction.input),
              "type": "token",
              "coinspecific": {
                  "tokenAddress": transaction.to
              }
           }
        ],
        "hash": transaction.hash,
        "currency":"ETH",        
        "state": receipt.status == '0x1'? 'confirmed':'pending',
        "depositType":"Contract",
        "chain": "ETH.main"
     }
     
    return result;
}

function createContractResponse(transaction, receipt){
    
    var result = {  
        "block":{  
           "blockHeight":transaction.blockNumber
        },
        "outs":[  
           {  
              "address": getToAddress(transaction.input),
              "value": getContractValue(transaction.input), 
              "type": "transfer",
              "coinspecific": {
                  "tracehash": transaction.hash
              }
  
           }
        ],
        "ins":[  
           {  
              "address": transaction.from,
              "value": "-" + getContractValue(transaction.input),
              "type": "transfer",
              "coinspecific": {
                  "tracehash": transaction.hash
              }
           }
        ],
        "hash": transaction.hash,
        "currency":"ETH",        
        "state": receipt.status == '0x1'? 'confirmed':'pending',
        "depositType":"Contract",
        "chain": "ETH.main"
     }
     
    return result;
}

function getToAddress(input){
    return '0x' + input.substring(34, 74);
}

function getTokenQty(input){
  
     return web3.toBigNumber('0x' + input.substring(74, input.length)).toString(10)
}
function getContractValue(input){
    return web3.toBigNumber('0x'+input.substring(74,138)).toString(10)
    }
module.exports = transactionService;