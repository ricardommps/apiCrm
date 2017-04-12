var express = require('express');
var request = require("request");
var async = require('async');
var unique = require('array-unique');
var router = express.Router();

router.get('/perfilUsuario', function(req, res, next) {
    var id_user = req.query.id_user;
    var id_contact = req.query.id_contact;
    var url = "http://world.conektta.info/api/estatisticas/perfilUsuario/" + id_user + "/" +id_contact+"/";
    console.log(req.query);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
        }
        console.log(">>>>>>");
        console.log(response);
        //console.log(response.body);
        // var jsonres = JSON.parse(response.body);
        res.json(response.body);
    })
});

router.get('/mapaestabelecimentos', function(req, res, next) {
    var id_user = req.query.id_user;
    var url = "http://world.conektta.info/api/estatisticas/mapaestabelecimentos/" + id_user ;
    console.log(url);
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

module.exports = router;
