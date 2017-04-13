var express = require('express');
var request = require("request")
var jwt = require('jsonwebtoken');
var router = express.Router();



router.get('/', function(req, res, next) {
    console.log("login");
    var user = {
        username: req.param('username'),
        password: req.param('password')
    } ;

    var url = "http://world.conektta.info/api/usuarios?login=" + user.username + "," +user.password;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.json(error);
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

        }


        //res.json(response.body);
    });

    //res.json(body);

});

module.exports = router;



