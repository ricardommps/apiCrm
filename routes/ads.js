var express = require('express');
var router = express.Router();
var request = require("request");
var AdButler = require("adbutler");
var async = require('async');
var adbutler = new AdButler({
    'apiKey': 'ebe604963bdb8e8a5ddfa4794dac2563'
});

router.get('/campaignsList', function (req, res, next) {

    var token = "?api_token="+global.token;
    var id_user = req.query.id_user;
    var url = "http://world.conektta.info/api/consultas/ads/" +
        id_user + token;
    console.log(url);
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







module.exports = router;