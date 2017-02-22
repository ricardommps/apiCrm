var express = require('express');
var request = require("request");
var async = require('async');
var unique = require('array-unique');
var router = express.Router();



router.get('/lists', function(req, res, next) {
    var idUser = req.query.idUser
    console.log(idUser);
    var url = "http://world.conektta.info/api/contatos/getListasSms/"+idUser;
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

router.post('/createLists', function(req, res, next) {
    var url = "http://world.conektta.info/api/contatos/addlistsms";

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
            console.log(error);
            res.json(error);
        }
        console.log(">>>>>>>><<<<<<<<");
        console.log(response.body);
        // var jsonres = JSON.parse(response.body);
        res.json(response.body);

    })
});

router.get('/contacts', function(req, res, next) {
    var idUser = req.query.idUser
    var url = "http://world.conektta.info/api/contatos/getContatos/"+ idUser + "?where[phone_number]";
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

router.post('/contactsToList', function(req, res, next) {
    console.log(req.body);
    var url = "http://world.conektta.info/api/contatos/getContatosListasSms?arr_listas="+req.body;
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
        var json = JSON.parse(response.body);
        console.log(json);
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
    var url = "http://world.conektta.info/api/sms/add";
    console.log(url);
    request({
        uri: url,
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        form:req.body
    }, function(error, response, body) {
        if (error) {
            res.json({ success: false, reponse: error });
        }
        console.log(body);
        res.json({ success: true, reponse: body });

    })
});


router.get('/campaigns', function(req, res, next) {
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





