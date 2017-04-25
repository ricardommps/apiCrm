var express = require('express');
var request = require("request");
var async = require('async');
var unique = require('array-unique');
var router = express.Router();



router.get('/lists', function(req, res, next) {
    var token = "?api_token="+global.token;
    var idUser = req.query.idUser
    console.log(idUser);
    var url = "http://world.conektta.info/api/contatos/getListasSms/"+idUser + token;
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
    var url = "http://world.conektta.info/api/contatos/addlistsms" + token;

    console.log(req.body);
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
    var idUser = req.query.idUser
    var url = "http://world.conektta.info/api/contatos/getContatosSms/"+ idUser + token;
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
    var url = "http://world.conektta.info/api/contatos/getContatosListasSms?arr_listas="+
        req.body + token;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }

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
    var url = "http://world.conektta.info/api/sms/add" + token;
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
    var idUser = req.query.idUser
    var url = "http://world.conektta.info/api/sms?where[id_dono_campanha]=" +
        idUser + token;
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





