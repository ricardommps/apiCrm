var request = require("request");
var striptags = require('striptags');
var aws = require("aws-sdk");

var SMSAPI = require('smsapicom'),
    smsapi = new SMSAPI();

smsapi.authentication
    .login('conektta', 'b7d76ae495b90e0b5f7f6f7b7199a389');



aws.config.loadFromPath(__dirname + '/../config-aws-ses.json');
var ses = new aws.SES();
module.exports = function (io) {
    'use strict';
    io.on('connection', function (socket) {

        socket.on('send:sendSms', function (data, callback) {
            console.log(">>>sendSms");
            var operation = data.operation[0];
            var create = data.create[0];
            var credits = data.credits;
            var sms = data.sms[0];
            var jsonReturn = {};

            if (create.Message.cost < credits) {
                // Salvar campanha
                console.log(">>>Salvar campanha");
                console.log(create);
                var url = "http://world.conektta.info/api/sms/add";
                request({
                    uri: url,
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    },
                    form: create
                }, function (error, response, body) {
                    if (error) {
                        console.log(error);
                        callback(error);
                    }
                    console.log("--------------------------------");
                    console.log(body);
                    console.log("--------------------------------");
                    if (body === "Campanha gravada com sucesso") {
                        console.log(">>>Campanha gravada com sucesso");
                        console.log(">>>SEND SMS");
                        console.log("--------------");
                        // From - Info
                        // Message
                        // TO array
                        console.log(sms.from);
                        console.log(sms.to);
                        console.log(sms.message);
                        console.log("--------------");
                        smsapi.message
                            .sms()
                            .from(sms.from)
                            .to(sms.to)
                            .message(sms.message)
                            .execute()
                            .then(function (result) {
                                console.log("then - smsapi.message");
                                if(result.count > 0){
                                    console.log(result);
                                    console.log(">>>Debita credito");

                                    var url = "http://world.conektta.info/api/credits/add";

                                    request({
                                        uri: url,
                                        method: "POST",
                                        form: operation
                                    }, function (error, response, body) {
                                        if (error) {
                                            // console.log(error);
                                            callback(error);
                                        }
                                        //  console.log(body);
                                        if (body == "Dados inseridos com sucess") {

                                            // Atualiza credito
                                            updateCreditsSms(operation.id_usuario, function (response) {
                                                // console.log(response);
                                                if (response.status) {
                                                    callback(response.status);
                                                }
                                            })
                                        } else {
                                            callback("Error");
                                        }
                                    });

                                }else{
                                    console.log("error");
                                    console.log(result);
                                }

                            })
                            .catch(function (err) {
                                console.log("catch - smsapi.message");
                                if(err.invalid_numbers.lengt > 0){
                                    callback(err.invalid_numbers.message);
                                }

                            });
                    } else {
                        callback({
                            success: false,
                            mensage: "Errro ao gravar campanha"
                        });
                    }
                })

            } else {
                callback();
            }
        });

        socket.on('send:balanceSms', function (data) {
            // var id_usuario = req.param('idUsuario');

            var url = "http://world.conektta.info/api/credits/" + data.id + "/sms";
            request = require("request");
            request({
                uri: url,
                method: "GET"
            }, function (error, response, body) {
                if (error) {
                    socket.broadcast.emit('send:errorBalanceEmail', error);
                }
                if (response.body == '"Nao foi encontrado creditos para este usuario"' ||
                    response.body == '"parametro invalido"') {
                    // console.log(">>>ERROR")
                    socket.emit('send:errorBalanceSms', response.body);

                } else {
                   // console.log(response.body);
                    socket.emit('send:sucessBalanceSms', response.body);
                }
                // socket.emit('send:sucessBalanceEmail',response.body);
                // var jsonres = JSON.parse(response.body);
                // res.json(response.body);
            })
        });


        var updateCreditsSms = function (idUser, callback) {
            var url = "http://world.conektta.info/api/credits/" + idUser + "/sms";
            //console.log(url);
            request = require("request");
            request({
                uri: url,
                method: "GET"
            }, function (error, response, body) {
                if (error) {
                    socket.broadcast.emit('send:errorBalanceSms', error);
                    var returnJson = {
                        status: false,
                        returnObj: error
                    };
                    callback(returnJson);
                    //return returnJson;
                }
                console.log(response.body);
                if (response.body == '"Nao foi encontrado creditos para este usuario"' ||
                    response.body == '"parametro invalido"') {
                    socket.emit('send:errorBalanceEmail', response.body);
                    var returnJson = {
                        status: false,
                        returnObj: response.body
                    };
                    callback(returnJson);

                } else {
                    socket.emit('send:sucessBalanceSms', response.body);
                    socket.broadcast.emit('send:sucessBalanceSms', response.body);
                    var returnJson = {
                        status: true,
                        returnObj: response.body
                    };
                    callback(returnJson);
                }

            })
        };

    });


};
