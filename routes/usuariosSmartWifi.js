var express = require('express');
var request = require("request");
var router = express.Router();



router.get('/queryLicense', function(req, res, next) {
    var license = req.query.licensa;
    console.log(license);
    var url = "http://world.conektta.info/api/licencas/consulta/"+license;
    console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
        }
        if(response.body === 'A licença esta Disponivel'){
            res.json({ success: true, reponse: response.body });
        }else{
            res.json({ success: false, reponse: response.body });
        };

    })

});

router.post('/register', function(req, res, next) {

    var url = "http://world.conektta.info/api/estabelecimentos";
    console.log(url);
    console.log(req.body);
    request({
        uri: url,
        method: "POST",
        form:req.body
    }, function(error, response, body) {

        if (error) {
            res.send(error);
        }
        console.log(body);
        res.json({ success: true, reponse: body });

    })
});

router.get('/list', function(req, res, next) {
    var userId = req.query.idUser;
    console.log(userId);
    var url = "http://world.conektta.info/api/estabelecimentos?where[id_usuario]="+userId;
    console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
        }
        res.json({ success: true, response: response.body });

    })

});



module.exports = router;



