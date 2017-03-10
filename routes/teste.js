var express = require('express');
var request = require("request");
var router = express.Router();
var io = require('../app');



router.post('/', function(req, res, next) {
    res.json(req.body);
    io.on('connection', function (socket){
        socket.emit('send:teste', response.body);
    });


});

module.exports = router;




