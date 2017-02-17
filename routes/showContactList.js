var express = require('express');
var request = require("request");
var async = require('async');
var unique = require('array-unique');
var router = express.Router();


router.get('/', function(req, res, next) {
    var idUser = req.query.idUser
    console.log(idUser);
    var url = "http://world.conektta.info/api/contatos/getListas/"+idUser;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
        }
        console.log(response.body);
        // var jsonres = JSON.parse(response.body);
        res.json(response.body);

    })
});

router.post('/getContatosLista', function(req, res, next) {
    console.log(req.body);
    var url = "http://world.conektta.info/api/contatos/getContatosListas?arr_listas="+req.body;
    console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
        }

        var json = JSON.parse(response.body);
        var arrayContacts = [];

        async.forEach(json, function (item) {

            async.forEach(item, function (item2) {
                arrayContacts.push(item2);

            });
        });

        arrayContacts = unique(arrayContacts);
        // var jsonres = JSON.parse(response.body);
        res.json(arrayContacts);

    })

});

module.exports = router;





