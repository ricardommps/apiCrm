var express = require('express');
var request = require("request");
var router = express.Router();
var SENDGRID_API_KEY = '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';
var sg = require('sendgrid')(SENDGRID_API_KEY);


router.post('/', function(req, res, next) {
    var request = sg.emptyRequest();
    request.method = 'POST';
    request.path = '/v3/campaigns/'+req.body.id+'/schedules/now';
    sg.API(request, function (error, response) {

        res.send(response.body);
    });

});

module.exports = router;





