var express = require('express');
var request = require("request");
var async = require('async');
var unique = require('array-unique');
var router = express.Router();



router.get('/listsUsers', function(req, res, next) {
    var token = "?api_token="+global.token;
    var idUser = req.query.idUser;
    var url = "http://world.conektta.info/api/contatos/getContatos/"+idUser+token;
    console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
       // console.log(response.body);
        // var jsonres = JSON.parse(response.body);
        res.json(response.body);

    })
});

router.get('/listsLastUsers', function(req, res, next) {
    var token = "?api_token="+global.token;
    var idUser = req.query.idUser;
    var url = "http://world.conektta.info/api/contatos/getconectados/"+idUser+token;
    console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        console.log(response.body);
        try{
            res.json(response.body);
        }catch (err){
            res.send(err);
            return;
        }




    })
});

router.get('/listCampaignsEmail', function(req, res, next){
    var token = "&api_token="+global.token;
    var idUser = req.query.idUser
    var url = "http://world.conektta.info/api/campanhas?where[id_dono_campanha]="+idUser+token;
    console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        //console.log(response.body);
        // var jsonres = JSON.parse(response.body);
        try{
            res.json(response.body);
        }catch (err){
            res.send(err);
            return;
        }


    })
});

router.get('/listCampaignsSms', function(req, res, next) {
    var token = "&api_token="+global.token;
    var idUser = req.query.idUser
    var url = "http://world.conektta.info/api/sms?where[id_dono_campanha]=" + idUser+token;
    console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function (error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
      //  console.log(response.body);
        // var jsonres = JSON.parse(response.body);
        try{
            res.json(response.body);
        }catch (err){
            res.send(err);
            return;
        }


    })
});



module.exports = router;





