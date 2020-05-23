var transactionService = require('../service/transactionService');

module.exports = function(app) {

    app.get("/eth/api/v1/transaction/:txId", function (req, res) {
        return transactionService.getTransaction(req, res);
    });    

};
