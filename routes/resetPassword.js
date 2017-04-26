var express = require('express');
var request = require("request");
var jwt = require('jsonwebtoken');
var router = express.Router();

var crypto = require('crypto');

router.post('/consultasUsers', function (req, res, next) {
    var url = "http://world.conektta.info/api/consultas/users";
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
    var url = "http://world.conektta.info/api/consultas/envio";
    request({
        uri: url,
        method: "POST",
        form: req.body
    }, function (error, response, body) {

        if (error) {
            res.send(error);
            return;
        }
        console.log(body);
        if(body == 'Codigo Enviado para o email'){
            res.json({success: true, response:body});
        }else{
            res.json({success: false});
        }
    })
});


router.post('/codeValidation', function (req, res, next) {
    var url = "http://world.conektta.info/api/consultas/codigo";
    request({
        uri: url,
        method: "POST",
        form: req.body
    }, function (error, response, body) {

        if (error) {
            res.send(error);
            return;
        }
        console.log(body);
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
        password: crypto.createHash('md5').update(req.body.password).digest("hex")
    } ;

    console.log(dataUpdateSenha);

    var url = "http://world.conektta.info/api/consultas/updateSenha";
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
