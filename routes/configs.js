var express = require('express');
var request = require("request");
var async = require('async');
var router = express.Router();
var config = require('../config.json');
var pathname = '';


router.get('/valuesService', function (req, res, next) {
    var token = "?api_token=" + global.token;
    var userId = req.query.idUser;
    pathname = 'usuarios/configs/';
    var url = config.word_url + pathname + userId + token;
    //console.log(url);
    // var url = "http://world.conektta.info/api/licencas/consulta/"+license + token;
    request({
        uri: url,
        method: "GET"
    }, function (error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        res.json(JSON.parse(body));

    })
});


module.exports = router;




