var express = require('express');
var request = require("request");
var router = express.Router();

/* GET home page. */

router.post('/all', function(req, res, next) {

    var url = "http://world.conektta.info/api/relatorios/dashboard/" + req.body.id_CRM + "/" + req.body.mes + "/" + req.body.ano + "/" + req.body.id_pa +"/";
    request({
        uri: url,
        method: "GET",
    }, function(error, response, body) {

        if (error) {
            res.send(error);
        }
        res.json({ success: true, reponse: body });

    })
});


module.exports = router;


