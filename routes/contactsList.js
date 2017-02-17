var express = require('express');
var request = require("request");
var router = express.Router();
var base64 = require('base-64');
var SENDGRID_API_KEY = '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';
var sg = require('sendgrid')(SENDGRID_API_KEY);
var request = sg.emptyRequest();


router.get('/', function(req, res, next) {
    var idUser = req.query.idUser
    var url = "http://world.conektta.info/api/contatos/getContatos/"+idUser;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
        }
        console.log(response.body);
        // var jsonres = JSON.parse(response.body);
        res.json(response.body);

    })

});
module.exports = router;




