var express = require('express');
var request = require("request");
var async = require('async');
var router = express.Router();
var aws = require("aws-sdk");

aws.config.loadFromPath(__dirname + '/../config-aws-ses.json');
var ses = new aws.SES();

router.get('/listVerifiedEmailAddresses', function(req, res, next) {

    var email = req.query.email;
    //console.log(email);
    var verifyEmailIdentity = false;

    ses.listVerifiedEmailAddresses(function(err, data) {
        if(err) {
            //console.log(err);
            res.json(err);
        }
        else {
            //console.log(data.VerifiedEmailAddresses);
            async.forEach(data.VerifiedEmailAddresses, function (item) {
                if(item === email ){
                    //res.json({ success: true, message: 'Email validado.' });
                    verifyEmailIdentity = true;
                    return;
                }
            });
            res.json({ verifyEmailIdentity: verifyEmailIdentity});
        }
    });

});

router.get('/verifyEmailIdentity', function(req, res, next) {

    var email = req.query.email;
    //console.log(email);

    var params = {
        EmailAddress: email
    };

    ses.verifyEmailAddress(params, function(err, data) {
        if(err) {
            //console.log(err);
            res.json(err);

        }
        else {
           // console.log(data);
            res.json(data);

        }
    });

});

module.exports = router;
