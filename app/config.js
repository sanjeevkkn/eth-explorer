// Put your infura token here.
var INFURA_TOKEN = "d0087e9cb42e43789431892673cfe48b"

var config ={  
    "port" : 3000,
    "infuraToken": INFURA_TOKEN,
    "defaultChain" : "MAIN_NET",
    "chain":{  
       "MAIN_NET":{  
          name:"Ethereum Main Net",
          url:"https://mainnet.infura.io/v3/"         + INFURA_TOKEN
       }
       
    }
 }

module.exports = config;