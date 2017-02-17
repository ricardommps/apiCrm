var express = require('express');
var request = require("request");
var router = express.Router();



router.get('/', function(req, res, next) {
    var idUser = req.query.idUser
    console.log(idUser);
    var url = "http://world.conektta.info/api/contatos/getContatos/"+idUser;
    console.log(url);
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


router.post('/', function(req, res, next) {


    var url = "http://world.conektta.info/api/contatos/addlist";

    console.log(req.body);
    request({
        uri: url,
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        form:req.body
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
        }
        console.log(">>>>>>>><<<<<<<<");
        console.log(response.body);
        // var jsonres = JSON.parse(response.body);
        res.json(response.body);

    })

});

module.exports = router;



