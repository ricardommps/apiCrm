var express = require('express');
var request = require("request");
var router = express.Router();

/* GET home page. */

router.post('/all', function(req, res, next) {

    var url = "http://world.conektta.info/api/relatorios/dashboard/" + req.body.id_CRM + "/" + req.body.mes + "/" + req.body.ano + "/" + req.body.id_pa +"/";
    console.log(url);
    request({
        uri: url,
        method: "GET",
    }, function(error, response, body) {

        if (error) {
            res.send(error);
        }
        console.log(body);
        res.json({ success: true, response: body });

    })
});

router.get('/listPas', function(req, res, next) {
    var idUser = req.query.idUser;

    var url = "http://world.conektta.info/api/relatorios/pas/"+idUser;
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            res.send(error);
        }
        if(body === 'Nao existem PAs para este estabelecimento'){
            res.json({ success: false, reponse: body });
        }else{
            res.json({ success: true, reponse: body });
        }
    })
});


module.exports = router;


