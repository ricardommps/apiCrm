var express = require('express');
var request = require("request");
var router = express.Router();

/* GET home page. */

router.post('/all', function(req, res, next) {
    var token = "?api_token="+global.token;
    var url = "http://world.conektta.info/api/relatorios/dashboard/" +
        req.body.id_CRM + "/" + req.body.mes + "/" + req.body.ano +
        "/" + req.body.id_pa +"/" + token;
    console.log(url);
    request({
        uri: url,
        method: "GET",
    }, function(error, response, body) {

        if (error) {
            res.send(error);
            return;
        }
        console.log(body);
        if(body == 'Nao existem conexoes neste PA'){
            res.json({ success: false, response: body });
        }else{
            res.json({ success: true, response: body });
        }


    })
});

router.get('/listPas', function(req, res, next) {
    var token = "?api_token="+global.token;
    var idUser = req.query.idUser;
    var url = "http://world.conektta.info/api/relatorios/pas/"+idUser + token;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        if(body === 'Nao existem PAs para este estabelecimento'){
            res.json({ success: false, reponse: body });
        }else{
            res.json({ success: true, reponse: body });
        }
    })
});


module.exports = router;


