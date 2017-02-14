var express = require('express');
var request = require("request");
var router = express.Router();
var SENDGRID_API_KEY = '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';
var sg = require('sendgrid')(SENDGRID_API_KEY);
var request = sg.emptyRequest();


router.get('/', function(req, res, next) {

    request.body = {
        "description": "Suggestions for products our users might like.",
        "is_default": true,
        "name": "Product Suggestions"
    };
    request.method = 'POST'
    request.path = '/v3/asm/groups'
    sg.API(request, function (error, responseGroups) {
               if(responseGroups.statusCode == "201"){
            var idGroup = responseGroups.body.id;
            request.body = {
                "recipient_emails": [
                    "elvis@conektta.com.br",
                    "ricardommps@gmail.com"
                ]
            };
            request.path = '/v3/asm/groups/'+idGroup+'/suppressions'
            sg.API(request, function (error, responseSuppressions) {
                if(responseSuppressions.statusCode == "201"){
                    res.send(responseSuppressions.body);

                }else{
                    res.send(responseSuppressions.body);
                }
            })

        }else{
            res.send(responseGroups.body);
        }



    });



});

module.exports = router;


