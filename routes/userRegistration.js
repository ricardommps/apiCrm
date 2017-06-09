var express = require('express');
var request = require("request");
var async = require('async');
var unique = require('array-unique');
var router = express.Router();
var config = require('../config.json');
var pathname = '';

router.get('/filterUser', function(req, res, next) {
    var field = req.param('field');
    var value = req.param('value');
    var strFilter = "?where["+field+"]="+value;
    token = "&api_token=1";
    pathname = 'usuarios';
    var url = config.word_url + pathname + strFilter + token;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.json(error);
        }
        try{
            res.json(response.body);
        }catch (err){
            res.json(err);
        }

    });
});

router.post('/register', function(req, res, next) {
    pathname = 'usuarios';
    token = "?api_token=1";
    var url = config.word_url + pathname + token;
    request({
        uri: url,
        method: "POST",
        form:req.body
    }, function(error, response, body) {
        if (error) {
            res.json(error);
        }
        if(response){
            if(response.body.indexOf('id') > 0){
                try{
                    var jsonResponde = JSON.parse(response.body);
                    res.json({ success: true, response: JSON.parse(response.body) });
                }catch (err){
                    res.json({ success: false});
                }

            }else{
                res.json({ success: false});
            }
        }else{
            res.json({ success: false})
        }


    });
    //res.json(body);
});

router.post('/permissions', function(req, res, next) {
    pathname = 'usuarios/associar/estabelecimentos';
    token = "?api_token=1";
    var url = config.word_url + pathname + token;
    request({
        uri: url,
        method: "POST",
        form:req.body
    }, function(error, response, body) {
        if (error) {
            res.json(error);
        }
        if(response){
            if(response.body === 'Estabelecimentos associados com sucesso'){
                res.json({ success: true})
            }else{
                res.json({ success: false})
            }

        }else{
            res.json({ success: false})
        }


    });
    //res.json(body);
});

router.get('/userPermissions', function(req, res, next) {
    pathname = 'usuarios/permissoes/';
    var idUser = req.query.idUser;
    token = "?api_token="+global.token;
    var url = config.word_url + pathname + idUser + token;
    console.log(url);
    request({
        uri: url,
        method: "GET",
        form:req.body
    }, function(error, response, body) {
        if (error) {
            res.json(error);
        }
        console.log(body);
        if(response){
            if(response.body === 'Usuario não possui estabelecimentos cadastrados'){
                res.json({ success: false})
            }else{
                try{
                    var jsonResponde = JSON.parse(response.body);
                    res.json({ success: true, response: JSON.parse(response.body) });
                }catch (err){
                    res.json({ success: false})
                }
            }

        }else{
            res.json({ success: false})
        }


    });
    //res.json(body);
});



module.exports = router;

