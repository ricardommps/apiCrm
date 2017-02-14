var express = require('express');
var request = require("request");
var router = express.Router();



router.post('/', function(req, res, next) {
    //// Criar lista de contatos
    console.log(req.body);
    res.send(req.body);

});

module.exports = router;




