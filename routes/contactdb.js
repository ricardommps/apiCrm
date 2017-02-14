var express = require('express');
var request = require("request");
var router = express.Router();
var base64 = require('base-64');
var SENDGRID_API_KEY = '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';
var sg = require('sendgrid')(SENDGRID_API_KEY);
var request = sg.emptyRequest();


router.post('/', function(req, res, next) {
    //// Criar lista de contatos
    if ('OPTIONS' == req.method) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.send(200);
    }
    var jsonParans = req.body;

    var emaildecode = [];

    for(var i in jsonParans.contacts[0]){

        emaildecode.push(base64.encode(jsonParans.contacts[0][i].email));

    }
    console.log(emaildecode);
    request.body = {
        "name": jsonParans.listName
    };

    request.method = 'POST';
    request.path = '/v3/contactdb/lists';

    sg.API(request, function (error, responseLists) {
        /// RESPONSE CREATE CONTACTS LIST

        if(responseLists.statusCode == "201"){
            /// SUCCESS CREATE LIST
            var idListContact = responseLists.body.id;
            /// CREAT CONTACTS
            request.body = jsonParans.contacts[0];
            request.path = '/v3/contactdb/recipients';
            sg.API(request, function (error, responseAddrecipients) {

                if(responseAddrecipients.statusCode == "201"){

                    /// ADD CONTACTS TO LIST

                    request.body = emaildecode;
                    request.path = '/v3/contactdb/lists/'+idListContact+'/recipients';
                    sg.API(request, function (error, responseRecipients) {
                        /// RESPONSE ADD CONTACTS TO LIST
                        res.send(responseRecipients.body);
                    });
                }else{
                    res.send(responseCampaigns.body);
                }
            });
        }else{
            /// ERROR CREATE LIST
            res.send(responseLists.body);
        }
    });
});

module.exports = router;



