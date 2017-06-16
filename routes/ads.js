var express = require('express');
var router = express.Router();
var io = require('../app');
var request = require("request");
var AdButler = require("adbutler");
var async = require('async');
var adbutler = new AdButler({
    'apiKey': 'ebe604963bdb8e8a5ddfa4794dac2563'
});
var config = require('../config.json');


router.get('/campaignsList', function (req, res, next) {

    var token = "?api_token="+global.token;
    var id_user = req.query.id_user;
    var pathname = 'consultas/ads/';
    var url = config.word_url + pathname + id_user + token;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        try{
            if(response.body === '"Sem registros para esse usuario"'){
                res.json({success:true,response:response.body});
            }else{
                res.json({success:true,response:JSON.parse(response.body)});
            }

        }catch (err){
            res.json({success:false});
            return;
        }

    })

});

router.post('/stats', function (req, res, next) {

    var settings = req.body;

    adbutler.stats.read(settings)
        .then(function (stats) {
            res.json({success: true, response: stats});
        })
        .catch(function (statsError) {
           // console.log(statsError);
            res.json({success: false, response: statsError});
        });


});








module.exports = router;