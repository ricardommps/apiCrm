var request = require("request");
var striptags = require('striptags');
var aws = require("aws-sdk");
aws.config.loadFromPath(__dirname + '/../config-aws-ses.json');
var ses = new aws.SES();
var clients = [];
var rooms = [];

var SMSAPI = require('smsapicom'),
    smsapi = new SMSAPI();
smsapi.authentication
    .login('xxx', 'xxxxx');



module.exports = function (io) {
    'use strict';


    io.on('connection', function (socket) {
        clients.push(socket)
        socket.on("connection", function (client) {
            var jsonClient =  JSON.parse(client);
            rooms.push(jsonClient[0].username);
        });

        socket.on('send:balanceSms', function (data) {
            // var id_usuario = req.param('idUsuario');

            var url = "http://world.conektta.info/api/credits/" + data.id + "/sms";
            request({
                uri: url,
                method: "GET"
            }, function (error, response, body) {
                if (error) {
                    socket.broadcast.emit('send:errorBalanceSms', error,data);
                }

                socket.emit('send:sucessBalanceSms', response.body,data);
                // var jsonres = JSON.parse(response.body);
                // res.json(response.body);
            })
        });

        socket.on('send:sendSms', function (data, callback) {
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

                    if (body === "Campanha gravada com sucesso") {

                        smsapi.message
                            .sms()
                            .from(sms.from)
                            .to(sms.to)
                            .message(sms.message)
                            .execute()
                            .then(function (result) {
                                if (result.count > 0) {

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

                                } else {
                                    console.log("error");
                                    console.log(result);
                                }

                            })
                            .catch(function (err) {
                                if (err.invalid_numbers.lengt > 0) {
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
                    socket.broadcast.emit('send:errorBalanceSms', error,data);
                }
                if (response.body == '"Nao foi encontrado creditos para este usuario"' ||
                    response.body == '"parametro invalido"') {
                    // console.log(">>>ERROR")
                    socket.emit('send:errorBalanceSms', response.body,data);

                } else {
                    // console.log(response.body);
                    socket.emit('send:sucessBalanceSms', response.body,data);
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
                    socket.broadcast.emit('send:errorBalanceSms', error,idUser);
                    var returnJson = {
                        status: false,
                        returnObj: error
                    };
                    callback(returnJson);
                    //return returnJson;
                }
                if (response.body == '"Nao foi encontrado creditos para este usuario"' ||
                    response.body == '"parametro invalido"') {
                    socket.emit('send:errorBalanceSms', response.body,idUser);
                    var returnJson = {
                        status: false,
                        returnObj: response.body
                    };
                    callback(returnJson);

                } else {
                    socket.emit('send:sucessBalanceSms', response.body,idUser);
                    socket.broadcast.emit('send:sucessBalanceSms', response.body,idUser);
                    var returnJson = {
                        status: true,
                        returnObj: response.body
                    };
                    callback(returnJson);
                }

            })
        };

        socket.on('send:templateEmail', function (data, callback) {


           socket.broadcast.emit('send:templateEmail', data);
           // socket.broadcast.to("ricardommps").emit('send:templateEmail', data);
            // this.io.emit('send:templateEmail', data);
            callback("success!");
        });

        socket.on('send:sendEmail', function (data, callback) {

            var operation = data.operation[0];
            var create = data.create[0];
            var credits = data.credits;
            var email = data.email[0];
            var jsonReturn = {};

            if (create.Message.cost < credits) {
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
                    if (body === "Campanha gravada com sucesso") {
                        // Envia campanha

                        ses.sendEmail(email, function (err, data) {
                            if (err) {
                                console.log(err);
                                callback(err);
                            } else {

                                // Debita credito
                                var url = "http://world.conektta.info/api/credits/add";
                                request({
                                    uri: url,
                                    method: "POST",
                                    form: operation
                                }, function (error, response, body) {
                                    if (error) {
                                        callback(error);
                                    }
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
                    socket.broadcast.emit('send:errorBalanceEmail', error, data);
                }
                if (response.body == '"Nao foi encontrado creditos para este usuario"' ||
                    response.body == '"parametro invalido"') {
                    // console.log(">>>ERROR")
                    socket.emit('send:errorBalanceEmail', response.body, data);

                } else {
                    // console.log(response.body);
                    socket.emit('send:sucessBalanceEmail', response.body, data);
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
                    socket.broadcast.emit('send:errorBalanceEmail', error,idUser);
                    var returnJson = {
                        status: false,
                        returnObj: error
                    };
                    callback(returnJson);
                    //return returnJson;
                }
                if (response.body == '"Nao foi encontrado creditos para este usuario"' ||
                    response.body == '"parametro invalido"') {
                    socket.emit('send:errorBalanceEmail', response.body,idUser);
                    var returnJson = {
                        status: false,
                        returnObj: response.body
                    };
                    callback(returnJson);

                } else {
                    socket.broadcast.emit('send:sucessBalanceEmail', response.body,idUser);


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