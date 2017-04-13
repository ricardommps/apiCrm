var express = require('express');
var request = require("request");
var async = require('async');
var unique = require('array-unique');
var router = express.Router();



router.get('/lists', function(req, res, next) {
    var idUser = req.query.idUser;
    var url = "http://world.conektta.info/api/contatos/getListas/"+idUser;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
        }
        //console.log(response.body);
        // var jsonres = JSON.parse(response.body);
        res.json(response.body);

    })
});

router.post('/createLists', function(req, res, next) {
    var url = "http://world.conektta.info/api/contatos/addlist";


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

        // var jsonres = JSON.parse(response.body);
        res.json(response.body);

    })
});

router.get('/contacts', function(req, res, next) {
    var idUser = req.query.idUser
    var url = "http://world.conektta.info/api/contatos/getContatos/"+idUser;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
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

    var url = "http://world.conektta.info/api/contatos/getContatosListas?arr_listas="+req.body;

    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
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
    var url = "http://world.conektta.info/api/campanhas/add";
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
            res.json({ success: false, reponse: error });
        }
        res.json({ success: true, reponse: body });

    })
});

router.get('/campaigns', function(req, res, next){
    var idUser = req.query.idUser
    var url = "http://world.conektta.info/api/campanhas?where[id_dono_campanha]=" + idUser + "&limit=50";
    //console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
        }
       // console.log(response.body);
        // var jsonres = JSON.parse(response.body);
        res.json(response.body);

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
            res.json({ success: false, reponse: error });
        }
        //console.log(body);
        res.json(body);

    })
});

module.exports = router;





