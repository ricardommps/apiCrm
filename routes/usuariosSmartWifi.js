var express = require('express');
var request = require("request");
var async = require('async');
var router = express.Router();
var config = require('../config.json');
var pathname = '';



router.get('/queryZipCod', function(req, res, next) {
    var cep = req.query.cep;
    var url = viacep_url + cep + "/json/";
   // var url = "https://viacep.com.br/ws/"+cep+"/json/"

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

router.get('/queryLicense', function(req, res, next) {
    var token = "?api_token="+global.token;
    var license = req.query.licensa;
    pathname = 'licencas/consulta/';
    var url = config.word_url + pathname + license + token;
   // var url = "http://world.conektta.info/api/licencas/consulta/"+license + token;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        if(response.body === 'A licença esta Disponivel'){
            res.json({ success: true, reponse: response.body });
        }else{
            res.json({ success: false, reponse: response.body });
        };

    })

});

router.post('/register', function(req, res, next) {
    var token = "?api_token="+global.token;
    pathname = 'estabelecimentos';
    var url = config.word_url + pathname + token;
   // var url = "http://world.conektta.info/api/estabelecimentos" + token;
    request({
        uri: url,
        method: "POST",
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

router.get('/list', function(req, res, next) {
    var token = "?api_token="+global.token;
    var userId = req.query.idUser;
    pathname = 'licencas/listarestabelecimentos/';
    var url = config.word_url + pathname + userId + token;
    //var url = "http://world.conektta.info/api/licencas/listarestabelecimentos/"+userId + token;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        if(response.body == 'Nao existem licencas para esse usuario'){
            res.json({ success: false, response: response.body });
        }else{

            try{
                var arrayResponse = JSON.parse(response.body);
                var responseArray = [];
                async.forEach(arrayResponse, function (value) {
                    if(value.status === "A" || value.status === "L" ){
                        responseArray.push(value);
                    }
                });
                var json = JSON.stringify(responseArray);
                res.json({ success: true, response: json });
            }catch (err){
                res.send(err);
                return;
            }

        }


    })

});



module.exports = router;



