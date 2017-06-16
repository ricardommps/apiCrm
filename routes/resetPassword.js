var express = require('express');
var request = require("request");
var jwt = require('jsonwebtoken');
var router = express.Router();

var crypto = require('crypto');
var config = require('../config.json');
var pathname = '';

router.post('/consultasUsers', function (req, res, next) {
    pathname = 'consultas/users';
    var url = config.word_url + pathname;
   // var url = "http://world.conektta.info/api/consultas/users";
    request({
        uri: url,
        method: "POST",
        form: req.body
    }, function (error, response, body) {

        if (error) {
            res.send(error);
            return;
        }
        if(body == '"ERRO"'){
            res.json({success: false});
        }else{
            try {
                res.json({success: true, response: JSON.parse(body)});
            } catch (err) {
                res.json({success: false});
            }
        }


    })
});

router.post('/sendCode', function (req, res, next) {
    pathname = 'consultas/envio';
    var url = config.word_url + pathname;
   // var url = "http://world.conektta.info/api/consultas/envio";
    request({
        uri: url,
        method: "POST",
        form: req.body
    }, function (error, response, body) {

        if (error) {
            res.send(error);
            return;
        }
       // console.log(body);
        if(body == 'Codigo Enviado para o email' || body == 'Codigo Enviado para o celular'){
            res.json({success: true, response:body});
        }else{
            res.json({success: false});
        }
    })
});


router.post('/codeValidation', function (req, res, next) {
    pathname = 'consultas/codigo';
    var url = config.word_url + pathname;
   // var url = "http://world.conektta.info/api/consultas/codigo";
    request({
        uri: url,
        method: "POST",
        form: req.body
    }, function (error, response, body) {

        if (error) {
            res.send(error);
            return;
        }
        if(body == 'Codigo valido'){
            res.json({success: true, response:body});
        }else{
            res.json({success: false});
        }
    })
});

router.post('/updateSenha', function (req, res, next) {

    var dataUpdateSenha = {
        id_usuario: req.body.id_usuario,
        password: req.body.password
    } ;

    pathname = 'consultas/updateSenha';
    var url = config.word_url + pathname;

   // var url = "http://world.conektta.info/api/consultas/updateSenha";
    request({
        uri: url,
        method: "POST",
        form: dataUpdateSenha
    }, function (error, response, body) {

        if (error) {
            res.send(error);
            return;
        }
        if(body == 'Senha atualizada com sucesso'){
            res.json({success: true, response:body});
        }else{
            res.json({success: false});
        }

    })
});


module.exports = router;
