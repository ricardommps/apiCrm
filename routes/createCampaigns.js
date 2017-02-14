var express = require('express');
var request = require("request");
var router = express.Router();
var SENDGRID_API_KEY = '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';
var sg = require('sendgrid')(SENDGRID_API_KEY);
var request = sg.emptyRequest();

router.post('/', function(req, res, next) {

    var jsonParans = req.body;
    var request = sg.emptyRequest();

    request.body = {
        "title": jsonParans.title,
        "subject": jsonParans.subject,
        "sender_id": 100787,
        "list_ids": jsonParans.list_ids,
        "categories": [
            "spring line"
        ],
        "suppression_group_id": 2321,
        "custom_unsubscribe_url": "",
        "html_content": jsonParans.html_content,
        "plain_content": "Check out our spring line! [unsubscribe]"
    };

    request.method = 'POST';
    request.path = '/v3/campaigns';

    sg.API(request, function (error, responseCampaigns) {

        res.send(responseCampaigns.body);
    });

});

module.exports = router;




