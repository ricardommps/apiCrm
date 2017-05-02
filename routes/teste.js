var express = require('express');
var request = require("request");
var router = express.Router();
var io = require('../app');



router.post('/', function(req, res, next) {
    console.log(">>>Teste conektados<<<");
    console.log(io.on);
    io.on('connection', function (socket){
        console.log('>>>conektados<<<');
        console.log(socket);
        socket.broadcast.emit('send:teste', response.body);
    });
    res.json(req.body);


});

module.exports = router;




