var express = require('express');
var request = require("request");
var router = express.Router();
var config = require('../config.json');
var pathname = '';

/* GET home page. */



router.post('/all', function(req, res, next) {
    var token = "?api_token="+global.token;
    pathname = 'relatorios/dashboard/';


    var url = config.word_url + pathname +
        req.body.id_CRM + "/" + req.body.qtd_dias + "/" + req.body.id_pas +"/" + token;

    request({
        uri: url,
        method: "GET",
    }, function(error, response, body) {

        if (error) {
            res.send(error);
            return;
        }
        if(body == 'Nao existem conexoes neste PA'){
            res.json({ success: false, response: body });
        }else{
            res.json({ success: true, response: body });
        }


    })
});

router.get('/listPas', function(req, res, next) {
    var token = "?api_token="+global.token;
    var idUser = req.query.idUser;
    pathname = 'relatorios/pas/';
    var url = config.word_url + pathname + idUser + token;
   // console.log(url);
   // var url = "http://world.conektta.info/api/relatorios/pas/"+idUser + token;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
       // console.log(">>>>>listPas<<<<<");
        //console.log(body);
        if(body === 'Nao existem PAs para este estabelecimento'){
            res.json({ success: false, reponse: body });
        }else{
            res.json({ success: true, reponse: body });
        }
    })
});

router.get('/listEstabelecimentos', function(req, res, next) {
    var token = "?api_token="+global.token;
    var idUser = req.query.idUser;
    pathname = 'estabelecimentos/listar/';
    var url = config.word_url + pathname + idUser + token;
    //console.log(url);
    // var url = "http://world.conektta.info/api/relatorios/pas/"+idUser + token;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }

        try{
            var jsonBody = JSON.parse(body);
            res.json({ success: true, response: jsonBody });
        }catch (err){
            res.json({ success: false, response: jsonBody });
        }


    })
});

router.get('/listEstabelecimentos', function(req, res, next) {
    var token = "?api_token="+global.token;
    var idUser = req.query.idUser;
    pathname = 'estabelecimentos/listar/';
    var url = config.word_url + pathname + idUser + token;
   // console.log(url);
    // var url = "http://world.conektta.info/api/relatorios/pas/"+idUser + token;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }

        try{
            var jsonBody = JSON.parse(body);
            res.json({ success: true, response: jsonBody });
        }catch (err){
            res.json({ success: false, response: jsonBody });
        }


    })
});


module.exports = router;


