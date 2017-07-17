var express = require('express');
var request = require("request")
var jwt = require('jsonwebtoken');
var router = express.Router();

var crypto = require('crypto');
var config = require('../config.json');
var pathname = '';



router.post('/consultasUsers', function(req, res, next) {
    pathname = 'consultas/users';
    var url = config.word_url + pathname;
   // var url = "http://world.conektta.info/api/consultas/users";
    res.send('respond with a resource');
});


router.post('/authenticate', function(req, res, next) {
    console.log(req.body);
    pathname = 'usuarios?login=';

    var url = config.word_url + pathname + req.body.username + "," + crypto.createHash('md5').update(req.body.password).digest("hex") + "&api_token=1";
    console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        try{
            var jsonres = JSON.parse(response.body);
            if(jsonres[0]){
                var token = jwt.sign({
                    exp: 1440,
                    data: {
                        username: req.body.username,
                        password: crypto.createHash('md5').update(req.body.password).digest("hex")
                    }
                }, 'secret');
                console.log(response.body);
                res.json({
                    success: true,
                    user: JSON.parse(response.body),
                    token: token
                });
            }else{
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            }
        }catch (err){
            res.send(err);
            return;
        }


        ///res.json(response.body);
    });
});


router.get('/', function(req, res, next) {
    var user = {
        username: req.param('username'),
        password: crypto.createHash('md5').update(req.param('password')).digest("hex")
    } ;
    pathname = 'usuarios?login=';
    var url = config.word_url + pathname + user.username + "," + user.password + "&api_token=1";
    console.log(url);
    //var url = "http://world.conektta.info/api/usuarios?login=" + user.username + "," +user.password+"&api_token=1";
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        try{
            var jsonres = JSON.parse(response.body);

            if(jsonres[0]){
                var token = jwt.sign({
                    exp: 1440,
                    data: user
                }, 'secret');
                res.json({
                    success: true,
                    user: response.body,
                    token: token
                });
            }else{
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            }
        }catch (err){
            res.send(err);
            return;
        }


        ///res.json(response.body);
    });

    //res.json(body);

});

module.exports = router;



