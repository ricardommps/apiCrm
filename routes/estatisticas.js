var express = require('express');
var request = require("request");
var async = require('async');
var unique = require('array-unique');
var router = express.Router();
var config = require('../config.json');
var pathname = '';

router.get('/perfilUsuario', function(req, res, next) {
    var token = "?api_token="+global.token;
    var id_user = req.query.id_user;
    var id_contact = req.query.id_contact;
    pathname = 'estatisticas/perfilUsuario/';
    var url = config.word_url + pathname + id_user + "/" +id_contact+"/" + token;

    /*var url = "http://world.conektta.info/api/estatisticas/perfilUsuario/" +
        id_user + "/" +id_contact+"/" + token;*/
    console.log(req.query);
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

router.get('/mapaestabelecimentos', function(req, res, next) {
    var token = "?api_token="+global.token;
    var id_user = req.query.id_user;
    pathname = 'estatisticas/mapaestabelecimentos/';
    var url = config.word_url + pathname + id_user + token;
    /*var url = "http://world.conektta.info/api/estatisticas/mapaestabelecimentos/" +
        id_user + token;*/
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

module.exports = router;
