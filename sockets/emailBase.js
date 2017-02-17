var request = require("request");
var striptags = require('striptags');
var aws = require("aws-sdk");

aws.config.loadFromPath(__dirname + '/../config-aws-ses.json');
var ses = new aws.SES();
module.exports = function (io) {
    'use strict';
    io.on('connection', function (socket) {

        socket.on('send:sendEmail', function (data, callback) {

            var operation = data.operation[0];
            var create = data.create[0];
            var credits = data.credits;
            var email = data.email[0];
            console.log(email);
            var jsonReturn = {};

            if (create.Message.cost < credits) {
                // Salvar campanha
                console.log(">>>START");
                var url = "http://world.conektta.info/api/campanhas/add";
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
                    console.log(">>>>>>>>>>>>>> RETURN SAVE");
                    console.log(body);
                    if (body === "Campanha gravada com sucesso") {
                        // Envia campanha



                        ses.sendEmail(email, function (err, data) {
                            if (err) {
                                console.log(err);
                                callback(err);
                            } else {
                                console.log(">>>>>>>>>>>>>> RETURN SEND");
                                console.log(data);
                                // Debita credito
                                var url = "http://world.conektta.info/api/credits/add";
                                request({
                                    uri: url,
                                    method: "POST",
                                    form: operation
                                }, function (error, response, body) {
                                    if (error) {
                                        console.log(error);
                                        callback(error);
                                    }
                                    console.log(">>>>>>>>>>>>>> RETURN CRED");
                                        console.log(body);
                                    if (body == "Dados inseridos com sucess") {

                                        // Atualiza credito
                                        updateCreditsEmail(operation.id_usuario, function (response) {
                                            console.log(response);
                                            if (response.status) {
                                                callback(response.status);
                                            }
                                        })
                                    } else {
                                        callback("Ero ao enviar email");
                                    }


                                })
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

        socket.on('send:balanceEmail', function (data) {
            // var id_usuario = req.param('idUsuario');

            var url = "http://world.conektta.info/api/credits/" + data.id + "/email";
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
                    socket.emit('send:errorBalanceEmail', response.body);

                } else {
                    // console.log(response.body);
                    socket.emit('send:sucessBalanceEmail', response.body);
                }
                // socket.emit('send:sucessBalanceEmail',response.body);
                // var jsonres = JSON.parse(response.body);
                // res.json(response.body);
            })
        });


        var updateCreditsEmail = function (idUser, callback) {
            var url = "http://world.conektta.info/api/credits/" + idUser + "/email";
            //console.log(url);
            request = require("request");
            request({
                uri: url,
                method: "GET"
            }, function (error, response, body) {
                if (error) {
                    socket.broadcast.emit('send:errorBalanceEmail', error);
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
                    socket.emit('send:sucessBalanceEmail', response.body);
                    socket.broadcast.emit('send:sucessBalanceEmail', response.body);
                    var returnJson = {
                        status: true,
                        returnObj: response.body
                    };
                    callback(returnJson);
                }

            })
        };

        var sendEmail = function (jsonParans, callback) {

            request = sg.emptyRequest();
            request.body = {
                "title": jsonParans.title,
                "subject": jsonParans.subject,
                "sender_id": 100787,
                "list_ids": jsonParans.list_ids,
                "categories": [
                    "spring line"
                ],
                "suppression_group_id": 2321,
                "custom_unsubscribe_url": "",
                "html_content": jsonParans.html_content,
                "plain_content": striptags(jsonParans.html_content) + " [unsubscribe]"
            };


            request.method = 'POST';
            request.path = '/v3/campaigns';

            sg.API(request, function (error, responseCampaigns) {

                if (responseCampaigns.statusCode == "201") {
                    var campaign_id = responseCampaigns.body.id;
                    request.path = '/v3/campaigns/' + campaign_id + '/schedules/now'
                    sg.API(request, function (error, responseSchedules) {
                        callback(responseSchedules.body);
                        //res.send(responseSchedules.body);

                    });
                } else {
                    callback(responseSchedules.body);
                    //res.send(responseCampaigns.body);
                }
                // res.send(responseCampaigns.body);
            });


        }

    });


};