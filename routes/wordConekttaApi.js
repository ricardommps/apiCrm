var express = require('express');
var request = require("request");
var router = express.Router();

/* GET home page. */
router.get('/users', function(req, res, next) {
    var token = "?api_token="+global.token;
    var url = "http://world.conektta.info/api/usuarios?cnkta" + token;
    request({
        uri: url,
        method: "GET",
        form:req.body
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        try{
            res.json(JSON.parse(response.body));
        }catch (err){
            res.send(err);
            return;
        }



    });
});

router.get('/balance', function(req, res, next) {
    var token = "?api_token="+global.token;
    var tp_credito = req.param('tpCredito');
    var id_usuario = req.param('idUsuario');
    var url = "http://world.conektta.info/api/credits/"+id_usuario+"/"+tp_credito + token;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
       // var jsonres = JSON.parse(response.body);
        try{
            res.json(response.body);
        }catch (err){
            res.send(err);
            return;
        }


    })
});

router.post('/postDebit', function(req, res, next) {
    var token = "?api_token="+global.token;
    var url = "http://world.conektta.info/api/credits/add" + token;
    request({
        uri: url,
        method: "POST",
        form:req.body
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        //res.json({ success: true, reponse: body });
        res.json({ success: true});

    })
});


module.exports = router;

