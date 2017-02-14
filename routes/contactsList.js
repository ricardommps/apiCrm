var express = require('express');
var request = require("request");
var router = express.Router();
var base64 = require('base-64');
var SENDGRID_API_KEY = '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';
var sg = require('sendgrid')(SENDGRID_API_KEY);
var request = sg.emptyRequest();


router.get('/', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    //// Exibir lista de contatos
    var request = sg.emptyRequest()
    request.method = 'GET'
    request.path = '/v3/contactdb/lists'
    sg.API(request, function (error, response) {
        res.send(response.body);
    })
});

module.exports = router;




