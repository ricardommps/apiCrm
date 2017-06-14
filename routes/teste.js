var express = require('express');
var request = require("request");
var router = express.Router();
var io = require('../app');



router.post('/', function(req, res, next) {
    io.on('connection', function (socket){

        socket.broadcast.emit('send:teste', response.body);
    });
    res.json(req.body);


});




module.exports = router;




