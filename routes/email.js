var express = require('express');
var request = require("request");
var async = require('async');
var unique = require('array-unique');
var router = express.Router();



router.get('/lists', function(req, res, next) {
    var token = "?api_token="+global.token;
    var idUser = req.query.idUser;
    var url = "http://world.conektta.info/api/contatos/getListas/"+idUser+token;
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

router.post('/createLists', function(req, res, next) {
    var token = "?api_token="+global.token;
    var url = "http://world.conektta.info/api/contatos/addlist"+token;
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
    var idUser = req.query.idUser
    var url = "http://world.conektta.info/api/contatos/getContatos/"+idUser+token;
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
    var url = "http://world.conektta.info/api/contatos/getContatosListas?arr_listas="+req.body+token;

    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }

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

    })
});

router.post('/campaigns', function(req, res, next){
    var token = "?api_token="+global.token;
    var url = "http://world.conektta.info/api/campanhas/add"+token;
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
    var idUser = req.query.idUser
    var url = "http://world.conektta.info/api/campanhas?where[id_dono_campanha]=" + idUser + "&limit=50"+token;
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
    var url = "https://api.elasticemail.com/template/add?version=2";
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

module.exports = router;





