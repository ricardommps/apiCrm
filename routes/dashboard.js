var express = require('express');
var request = require("request");
var async = require('async');
var unique = require('array-unique');
var router = express.Router();



router.get('/listsUsers', function(req, res, next) {
    var idUser = req.query.idUser;
    var url = "http://world.conektta.info/api/contatos/getContatos/"+idUser;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
        }
        console.log(response.body);
        // var jsonres = JSON.parse(response.body);
        res.json(response.body);

    })
});

router.get('/listCampaignsEmail', function(req, res, next){
    var idUser = req.query.idUser
    var url = "http://world.conektta.info/api/campanhas?where[id_dono_campanha]="+idUser;
    console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
        }
        console.log(response.body);
        // var jsonres = JSON.parse(response.body);
        res.json(response.body);

    })
});

router.get('/listCampaignsSms', function(req, res, next) {
    var idUser = req.query.idUser
    var url = "http://world.conektta.info/api/sms?where[id_dono_campanha]=" + idUser;
    console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function (error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
        }
        console.log(response.body);
        // var jsonres = JSON.parse(response.body);
        res.json(response.body);

    })
});


module.exports = router;





