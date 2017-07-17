var express = require('express');
var request = require("request");
var merge = require('merge-recursive');
var async = require('async');
var unique = require('array-unique');
var router = express.Router();
var config = require('../config.json');
var pathname = '';

router.get('/perfilUsuario', function(req, res, next) {
    var token = "?api_token="+global.token;
    var id_user = req.query.id_user;
    var id_contact = req.query.id_contact;
    pathname = 'estatisticas/perfilUsuario/';
    var url = config.word_url + pathname + id_user + "/" +id_contact+"/" + token;

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

router.get('/mapaestabelecimentos', function(req, res, next) {
    var token = "?api_token="+global.token;
    var id_user = req.query.id_user;
    pathname = 'estatisticas/mapaestabelecimentos/';
    if(req.query.pasId || req.query.pasId.length > 0){
        var url = config.word_url + pathname + id_user + "/" +  req.query.pasId + "/" +  token;
    }else{
        var url = config.word_url + pathname + id_user + token;
    }
   // console.log(">>>>>mapaestabelecimentos<<<<");
    //console.log(url);

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

router.get('/ranking', function(req, res, next) {
    var token = "?api_token="+global.token;
    var id_user = req.query.idUser;
    pathname = 'estatisticas/ranking/';
    if(req.query.pasId || req.query.pasId.length > 0){
        var url = config.word_url + pathname + id_user + "/" + req.query.dateRange + "/" + req.query.pasId + "/" +  token;
    }else{
        var url = config.word_url + pathname + id_user + token;
    }
    console.log(">>>>>ranking<<<<");
    console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        console.log(body);
        // var jsonres = JSON.parse(response.body);
        if(response.body == 'Sem dados para sua solicitacao'){
            res.json({ success: false });
        }else{
            try{
                res.json({ success: true, response: response.body });
            }catch (err){
                res.json({ success: false });
            }
        }


    })
});

router.get('/average', function(req, res, next) {
    var token = "?api_token="+global.token;
    var id_user = req.query.idUser;
    pathname = 'estatisticas/average/';
    if(req.query.pasId || req.query.pasId.length > 0){
        var url = config.word_url + pathname + id_user + "/" + req.query.dateRange + "/" + req.query.pasId + "/" +  token;
    }else{
        var url = config.word_url + pathname + id_user + token;
    }
    //console.log(">>>>>average<<<<");
    //console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        if(response.statusCode == 500){
            res.json({ success: false });
            return;
        }

        if(response.statusCode == 200){
            if(response.body == 'Sem dados para sua solicitacao'){
                res.json({ success: false });
                return;
            }else{
                try{
                    res.json({ success: true, response: response.body });
                    return;
                }catch (err){
                    res.json({ success: false });
                    return;
                }
            }
        }

    })
});

router.get('/phpUtils', function(req, res, next) {
    // var token = "&api_token="+global.token;
    //var arr1 = req.query.idUser;
    var gender_masculino = req.query.gender_masculino;
    var gender_feminino = req.query.gender_feminino;
    var gender_nd = req.query.gender_nd;
    var teste = merge(
        { a: 'a', b: 'b' },
        { b: 'c', c: 'd' }
    );

    res.send("ok");

});

module.exports = router;
