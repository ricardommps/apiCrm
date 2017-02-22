
var express = require('express');
var router = express.Router();

module.exports = function(io) {

    router.post('/', function(req, res) {

        io.sockets.broadcast.emit("send:templateEmail", req.body);
        res.send("sucess");
    });

    return router;
};

