var express = require('express');
var request = require("request");
var router = express.Router();
var SENDGRID_API_KEY = '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';
var sg = require('sendgrid')(SENDGRID_API_KEY);
var request = sg.emptyRequest();


router.get('/', function(req, res, next) {

    //// Criar lista de contatos

    request.body = {
        "name": "Lista conektta teste4"
    };

    request.method = 'POST';
    request.path = '/v3/contactdb/lists';

    sg.API(request, function (error, responseLists) {
        /// RESPONSE CREATE CONTACTS LIST
        if(responseLists.statusCode == "201"){
            /// SUCCESS CREATE LIST
            var idListContact = responseLists.body.id;

            /// CREAT CONTACTS

            request.body = [
                {
                    "email": "ricardommps@gmail.com",
                    "first_name": "Ricardo",
                    "last_name": "Matta"
                },
                {
                    "email": "camila@conektta.com.br",
                    "first_name": "Camila",
                    "last_name": "Nardi"
                },
                {
                    "email": "daniocosta@gmail.com" ,
                    "first_name": "Daniela",
                    "last_name": "Costa"
                },
                {
                    "email": "ffleck@gmail.com" ,
                    "first_name": "Fabio",
                    "last_name": "Fleck"
                }
            ];

            request.path = '/v3/contactdb/recipients';

            sg.API(request, function (error, responseAddrecipients) {
                if(responseAddrecipients.statusCode == "201"){

                    /// ADD CONTACTS TO LIST
                    request.body = [
                        'ZWx2aXNAZWFpbnRlcmF0aXZhLmNvbS5icg==',
                        'cmljYXJkb21tcHNAZ21haWwuY29t',
                        'ZWx2aXNAY29uZWt0dGEuY29tLmJyIA==',
                        'Y2FtaWxhQGNvbmVrdHRhLmNvbS5icg==',
                        'ZmZsZWNrQGdtYWlsLmNvbQ=='
                    ];
                    request.path = '/v3/contactdb/lists/'+idListContact+'/recipients';
                    sg.API(request, function (error, responseRecipients) {
                        /// RESPONSE ADD CONTACTS TO LIST
                        if(responseRecipients.statusCode == "201"){
                            /// SUCCESS ADD CONTACTS TO LIST

                            /// CREATE CAMPAIGNS
                            request.body = {
                                "title": "March Newsletter",
                                "subject": "New Products for Spring!",
                                "sender_id": 100787,
                                "list_ids": [
                                    idListContact
                                ],
                                "categories": [
                                    "spring line"
                                ],
                                "suppression_group_id": 2321,
                                "custom_unsubscribe_url": "",
                                "html_content": "<html><head><title></title></head><body><p>Check out our spring line!</p>  <a href='[unsubscribe]'>Click Here to Unsubscribe</a></body></html>",
                                "plain_content": "Check out our spring line! [unsubscribe]"
                            };

                            request.path = '/v3/campaigns';
                            sg.API(request, function (error, responseCampaigns) {
                                /// RESPONSE CREATE CAMPAIGNS
                                if(responseCampaigns.statusCode == "201"){
                                    ///SUCCESS CREATE CAMPAIGNS
                                    var campaign_id = responseCampaigns.body.id;
                                    //SEND EMAIL CAMPAIGN

                                    request.path = '/v3/campaigns/'+campaign_id+'/schedules/now';
                                    sg.API(request, function (error, responseSchedules) {
                                        /// RESPONSE SEND EMAIL
                                        res.send(responseSchedules.body);
                                    });

                                }else{
                                    res.send(responseCampaigns.body);

                                }
                            });

                        }else {
                            /// ERROR ADD CONTACTS TO LIST
                            res.send(responseRecipients.body);

                        }
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


