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
    pathname = 'contatos/getListas/';
    var url = config.word_url + pathname + idUser + token;
    //var url = "http://world.conektta.info/api/contatos/getListas/"+idUser+token;
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
    pathname = 'contatos/addlist';
    var url = config.word_url + pathname + token;
   // var url = "http://world.conektta.info/api/contatos/addlist"+token;
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

        // var jsonres = JSON.parse(response.body);
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
    pathname = 'contatos/getContatos/';
    if(req.query.pasId || req.query.pasId.length > 0){
        var url = config.word_url + pathname + idUser + "/" +  req.query.pasId + "/" +  token;
    }else{
        var url = config.word_url + pathname + idUser + token;
    }

    console.log(url);

    //var url = "http://world.conektta.info/api/contatos/getContatos/"+idUser+token;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        try{
            if(response.body == "Nao existem contatos para esse usuario"){
                res.json({ success: false, response: response.body });
            }else{

                res.json({ success: true, response: response.body });
            }
        }catch (err){
            res.json({ success: false, response: err });
        }

    })
});

router.post('/contactsToList', function(req, res, next) {
    var token = "&api_token="+global.token;
    pathname = 'contatos/getContatosListas?arr_listas=';
    var url = config.word_url + pathname + req.body + token;
   // var url = "http://world.conektta.info/api/contatos/getContatosListas?arr_listas="+req.body+token;

    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        try{
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
        }


    })
});

router.post('/campaigns', function(req, res, next){
    var token = "?api_token="+global.token;
    pathname = 'campanhas/add';
    var url = config.word_url + pathname + token;
    //var url = "http://world.conektta.info/api/campanhas/add"+token;
    //console.log(req.body);
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

router.get('/campaigns', function(req, res, next){
    var token = "&api_token="+global.token;
    var idUser = req.query.idUser;
    pathname = 'campanhas?where[id_dono_campanha]=';
    var url = config.word_url + pathname + idUser + "&limit=50"+token;
    //var url = "http://world.conektta.info/api/campanhas?where[id_dono_campanha]=" + idUser + "&limit=50"+token;
    //console.log(url);
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
        try{
            res.json(response.body);
        }catch (err){
            res.send(err);
            return;
        }


    })
});

router.post('/createTemplate', function(req, res, next){
    var url = config.elasticemail_url;
    //var url = "https://api.elasticemail.com/template/add?version=2";
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
        //console.log(body);
        try{
            res.json(body);
        }catch (err){
            res.send(err);
            return;
        }


    })
});

router.get('/getDadosCampanha', function(req, res, next) {
    var token = "?api_token="+global.token;
    var idUser = req.query.idUser;
    pathname = 'campanhas/getDadosCampanha/';
    var url = config.word_url + pathname + idUser + token;
    //var url = "http://world.conektta.info/api/campanhas/getDadosCampanha/"+idUser+token;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        try{
            res.json(JSON.parse(response.body));
        }catch (err){
            res.send(err);
            return;
        }
    })
});

router.get('/getCampanha', function(req, res, next) {
    var token = "?api_token="+global.token;
    var idCampanha = req.query.idCampanha;
    pathname = 'campanhas/getCampanha/';
    var url = config.word_url + pathname + idCampanha + token;
   // var url = "http://world.conektta.info/api/campanhas/getCampanha/"+idCampanha+token;
  //  console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        console.log(body);
        try{
            res.json({success:true,response:JSON.parse(response.body)});
        }catch (err){
            res.json({success:false});
        }
    })
});

module.exports = router;





