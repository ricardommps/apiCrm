var express = require('express');
var request = require("request");
var async = require('async');
var unique = require('array-unique');
var router = express.Router();
var config = require('../config.json');
var pathname = 'consultas/ads/';



router.get('/listsUsers', function(req, res, next) {
    var token = "?api_token="+global.token;
    var idUser = req.query.idUser;
    pathname = 'contatos/getContatos/';
    var url = config.word_url + pathname + idUser + token;
    //var url = "http://world.conektta.info/api/contatos/getContatos/"+idUser+token;

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
    pathname = 'contatos/getconectados/';
   // var url = config.word_url + pathname + idUser + token;
    //var url = "http://world.conektta.info/api/contatos/getconectados/"+idUser+token;
    var url = config.word_url + pathname + req.query.pasId + "/" +  token;
    //console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }

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
    pathname = 'campanhas?where[id_dono_campanha]=';
    var url = config.word_url + pathname + idUser + token;
    //var url = "http://world.conektta.info/api/campanhas?where[id_dono_campanha]="+idUser+token;

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
    var idUser = req.query.idUser;
    pathname = 'sms?where[id_dono_campanha]=';
    var url = config.word_url + pathname + idUser + token;
    //var url = "http://world.conektta.info/api/sms?where[id_dono_campanha]=" + idUser+token;

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





