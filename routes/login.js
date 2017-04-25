var express = require('express');
var request = require("request")
var jwt = require('jsonwebtoken');
var router = express.Router();

var crypto = require('crypto');



router.post('/consultasUsers', function(req, res, next) {
    var url = "http://world.conektta.info/api/consultas/users";
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

router.get('/', function(req, res, next) {
    var user = {
        username: req.param('username'),
        password: crypto.createHash('md5').update(req.param('password')).digest("hex")
    } ;

    console.log(user);
    var url = "http://world.conektta.info/api/usuarios?login=" + user.username + "," +user.password+"&api_token=1";
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        console.log(response.body);
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



