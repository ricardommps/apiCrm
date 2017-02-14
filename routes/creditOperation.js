var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/postDebit', function(req, res, next) {
    var url = "http://world.conektta.info/api/credits/add";
    request({
        uri: url,
        method: "POST",
        form:req.body
    }, function(error, response, body) {
        if (error) {
            res.json(error);
        }
        res.json({ success: true, message: body });

    });
});

router.get('/checkCredit', function(req, res, next) {
    res.send('checkCredit!');
});

module.exports = router;

