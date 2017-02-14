var express = require('express');
var request = require("request");
var router = express.Router();

/* GET home page. */
router.get('/users', function(req, res, next) {
    var url = "http://world.conektta.info/api/usuarios?cnkta";
    request({
        uri: url,
        method: "GET",
        form:req.body
    }, function(error, response, body) {
        if (error) {
            res.json(error);
        }
        var jsonres = JSON.parse(response.body);
        res.json(jsonres);

    });
});

router.get('/balance', function(req, res, next) {
    var tp_credito = req.param('tpCredito');
    var id_usuario = req.param('idUsuario');

    var url = "http://world.conektta.info/api/credits/"+id_usuario+"/"+tp_credito;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.json(error);
        }
       // var jsonres = JSON.parse(response.body);
        res.json(response.body);

    })
});

router.post('/postDebit', function(req, res, next) {

    var url = "http://world.conektta.info/api/credits/add";
    console.log(req.body);
    request({
        uri: url,
        method: "POST",
        form:req.body
    }, function(error, response, body) {
        if (error) {
            res.json(error);
        }
        //res.json({ success: true, reponse: body });
        res.json({ success: true});

    })
});


module.exports = router;

