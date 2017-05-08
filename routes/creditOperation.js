var express = require('express');
var router = express.Router();
var config = require('../config.json');
var pathname = '';

/* GET home page. */
router.post('/postDebit', function(req, res, next) {
    var token = "?api_token="+global.token;
    pathname = 'credits/add';
    var url = config.word_url + pathname  + token;
    //var url = "http://world.conektta.info/api/credits/add"+token;
    request({
        uri: url,
        method: "POST",
        form:req.body
    }, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        res.json({ success: true, message: body });

    });
});

router.get('/checkCredit', function(req, res, next) {
    res.send('checkCredit!');
});

module.exports = router;

