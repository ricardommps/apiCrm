var express = require('express');
var request = require("request");
var router = express.Router();
var base64 = require('base-64');
var SENDGRID_API_KEY = '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';
var sg = require('sendgrid')(SENDGRID_API_KEY);



router.get('/', function(req, res, next) {
    var request = sg.emptyRequest();
    request.queryParams["limit"] = '50';

    request.method = 'GET';
    request.path = '/v3/campaigns';
    sg.API(request, function (error, response) {
        res.send(response.body)
    })

});

module.exports = router;



