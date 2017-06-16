var express = require('express');
var request = require("request");
var async = require('async');
var unique = require('array-unique');
var router = express.Router();
var config = require('../config.json');
var pathname = '';



router.get('/lists', function(req, res, next) {
    var token = "?api_token="+global.token;
    var idUser = req.query.idUser;
    pathname = 'contatos/getListasSms/';
    var url = config.word_url + pathname + idUser + token;

   // var url = "http://world.conektta.info/api/contatos/getListasSms/"+idUser + token;
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

router.post('/createLists', function(req, res, next) {
    var token = "?api_token="+global.token;
    pathname = 'contatos/addlistsms';
    var url = config.word_url + pathname + token;
    //var url = "http://world.conektta.info/api/contatos/addlistsms" + token;

    request({
        uri: url,
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        form:req.body
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

router.get('/contacts', function(req, res, next) {
    var token = "?api_token="+global.token;
    var idUser = req.query.idUser;
    pathname = 'contatos/getContatosSms/';
    if(req.query.pasId || req.query.pasId.length > 0){
        var url = config.word_url + pathname + idUser + "/" +  req.query.pasId + "/" +  token;
    }else{
        var url = config.word_url + pathname + idUser + token;
    }

    //console.log(url);
   // var url = config.word_url + pathname + idUser + token;
    //var url = "http://world.conektta.info/api/contatos/getContatosSms/"+ idUser + token;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        if(response.body == "Nao existem contatos para esse usuario"){
            res.json({ success: false, response: response.body });
        }else{

            res.json({ success: true, response: response.body });
        }

    })
});

router.post('/contactsToList', function(req, res, next) {
    var token = "&api_token="+global.token;
    pathname = 'contatos/getContatosListasSms?arr_listas=';
    var url = config.word_url + pathname + req.body  + token;

   /* var url = "http://world.conektta.info/api/contatos/getContatosListasSms?arr_listas="+
        req.body + token;*/
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
       // console.log(response.body);
        try {
            var json = JSON.parse(response.body);
            var arrayContacts = [];
            async.forEach(json, function (item) {

                async.forEach(item, function (item2) {
                    arrayContacts.push(item2);

                });
            });

            arrayContacts = unique(arrayContacts);
            // var jsonres = JSON.parse(response.body);
            res.json(arrayContacts);
        }catch (err){
            res.send(err);
            return;
        }


    })
});

router.post('/campaigns', function(req, res, next){
    var token = "?api_token="+global.token;
    pathname = 'sms/add';
    var url = config.word_url + pathname + token;
    //var url = "http://world.conektta.info/api/sms/add" + token;
    request({
        uri: url,
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        form:req.body
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
       try{
           res.json({ success: true, reponse: body });
       }catch (err){
           res.send(err);
           return;
       }


    })
});


router.get('/campaigns', function(req, res, next) {
    var token = "&api_token="+global.token;
    var idUser = req.query.idUser;
    pathname = 'sms?where[id_dono_campanha]=';
    var url = config.word_url + pathname + idUser + token;
    /*var url = "http://world.conektta.info/api/sms?where[id_dono_campanha]=" +
        idUser + token;*/
    request({
        uri: url,
        method: "GET"
    }, function (error, response, body) {
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


module.exports = router;





