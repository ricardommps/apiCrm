var request = require("request");
var striptags = require('striptags');
var SENDGRID_API_KEY = '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';
var sg = require('sendgrid')(SENDGRID_API_KEY);
module.exports = function (io) {
    'use strict';
    io.on('connection', function (socket) {

        socket.on('send:balanceSms', function (data) {
            // var id_usuario = req.param('idUsuario');

            var url = "http://world.conektta.info/api/credits/" + data.id + "/sms";
            request({
                uri: url,
                method: "GET"
            }, function (error, response, body) {
                if (error) {
                    socket.broadcast.emit('send:errorBalanceSms', error);
                }

                socket.emit('send:sucessBalanceSms', response.body);
                // var jsonres = JSON.parse(response.body);
                // res.json(response.body);
            })
        });

    });


};