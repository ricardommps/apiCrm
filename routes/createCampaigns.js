var express = require('express');
var request = require("request");
var router = express.Router();


router.post('/', function(req, res, next) {
    var url = "http://world.conektta.info/api/campanhas/add";

    request({
        uri: url,
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        form:req.body
    }, function(error, response, body) {
        if (error) {
            res.json({ success: false, reponse: error });
        }
        console.log(body);
        res.json({ success: true, reponse: body });

    })

});

module.exports = router;




