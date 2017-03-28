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
    .login('conektta', 'b7d76ae495b90e0b5f7f6f7b7199a389');


module.exports = function (io) {
    'use strict';


    io.on('connection', function (socket) {
        clients.push(socket)
        socket.on("connection", function (client) {
            var jsonClient = JSON.parse(client);
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
                    socket.broadcast.emit('send:errorBalanceSms', error, data);
                }

                socket.emit('send:sucessBalanceSms', response.body, data);
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
                    socket.broadcast.emit('send:errorBalanceSms', error, data);
                }
                if (response.body == '"Nao foi encontrado creditos para este usuario"' ||
                    response.body == '"parametro invalido"') {
                    // console.log(">>>ERROR")
                    socket.emit('send:errorBalanceSms', response.body, data);

                } else {
                    // console.log(response.body);
                    socket.emit('send:sucessBalanceSms', response.body, data);
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
                    socket.broadcast.emit('send:errorBalanceSms', error, idUser);
                    var returnJson = {
                        status: false,
                        returnObj: error
                    };
                    callback(returnJson);
                    //return returnJson;
                }
                if (response.body == '"Nao foi encontrado creditos para este usuario"' ||
                    response.body == '"parametro invalido"') {
                    socket.emit('send:errorBalanceSms', response.body, idUser);
                    var returnJson = {
                        status: false,
                        returnObj: response.body
                    };
                    callback(returnJson);

                } else {
                    socket.emit('send:sucessBalanceSms', response.body, idUser);
                    socket.broadcast.emit('send:sucessBalanceSms', response.body, idUser);
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

        //api/envios/enviarCampanha

        socket.on('send:sendEmail', function (data, callback) {
            var operation = data.operation[0];
            var create = data.create[0];
            var credits = data.credits;
            var email = data.email[0];
            var template = data.template[0];
            //console.log(template);
            var jsonReturn = {};
            if (create.Message.cost <= credits) {

                //// Salvar campanha

                var url = "http://world.conektta.info/api/campanhas/add";

                request({
                    uri: url,
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    },
                    form: create
                }, function (error, response, body) {
                    console.log(error);
                    if (error) {
                        callback({
                            success: false,
                            mensage: error
                        });
                    }
                    try{
                        var campanha  = JSON.parse(response.body);
                       // console.log(campanha.id);
                        url = "https://api.elasticemail.com/template/add?version=2";
                        request({
                            uri: url,
                            method: "POST",
                            headers: {
                                "content-type": "application/json"
                            },
                            form: template
                        }, function (errorTemplate, responseTemplate, bodyTemplate) {
                            if(errorTemplate){
                                callback({
                                    success: false,
                                    mensage: errorTemplate
                                });
                            }

                            try{
                                var templateJson = JSON.parse(bodyTemplate);
                              //  console.log(templateJson);
                                if(templateJson.success){
                                    var sendEmail = {
                                        id_campanha :campanha.id,
                                        id_template  : templateJson.data
                                    };
                                   // console.log(sendEmail);
                                    url = "http://world.conektta.info/api/envios/enviarCampanha";
                                    request({
                                        uri: url,
                                        method: "POST",
                                        headers: {
                                            "content-type": "application/json"
                                        },
                                        form: sendEmail
                                    }, function (errorSendEmail, responseSendEmail, bodySendEmail) {
                                        if(errorSendEmail){
                                            callback({
                                                success: false,
                                                mensage: errorTemplate
                                            });
                                        }

                                        try{
                                            console.log("------------");
                                            console.log(responseSendEmail.body);
                                            console.log("------------");
                                            if(responseSendEmail.body === "Sucesso"){
                                                 console.log("Debita Credit")    ;
                                                //Debita Credito

                                                url = "http://world.conektta.info/api/credits/add";

                                                request({
                                                    uri: url,
                                                    method: "POST",
                                                    headers: {
                                                        "content-type": "application/json"
                                                    },
                                                    form:operation
                                                }, function(errorCredits, responseCredits, bodyCredits) {
                                                    if (errorCredits) {
                                                        callback({
                                                            success: true,
                                                            mensage: "Erro ao enviar email"
                                                        });
                                                    }
                                                    console.log(">>>>DEBITO");
                                                    console.log(bodyCredits);
                                                    console.log(">>>><<<<");
                                                    if (bodyCredits == "Dados inseridos com sucess") {

                                                        // Atualiza credito
                                                        updateCreditsEmail(operation.id_usuario, function (response) {
                                                            console.log(response.status);
                                                            if (response.status) {
                                                                callback({
                                                                    success: true,
                                                                    mensage: response.status
                                                                });
                                                                //callback(response.status);
                                                            }else{
                                                                callback({
                                                                    success: false,
                                                                    mensage: "Erro ao enviar email"
                                                                });
                                                            }
                                                        });

                                                    }else{
                                                        callback({
                                                            success: false,
                                                            mensage: "Erro ao enviar email"
                                                        });
                                                    }


                                                });
                                            }else {
                                                callback({
                                                    success: false,
                                                    mensage: "Erro ao enviar email"
                                                });
                                            }
                                        }catch (er){
                                            callback({
                                                success: false,
                                                mensage: "Erro ao enviar email"
                                            });
                                        }

                                    })
                                }else{
                                    callback({
                                        success: false,
                                        mensage: "Erro ao enviar email"
                                    });
                                }

                            }catch (e){
                                callback({
                                    success: false,
                                    mensage: "Erro ao enviar email"
                                });
                            }

                        })

                    }catch (err){
                        callback({
                            success: false,
                            mensage: "Erro ao enviar email"
                        });
                    }

                });

            } else {
                callback({
                    success: false,
                    mensage: "Você não possui creditos para enviar essa campanha"
                });
            }

        });

        /*socket.on('send:sendEmail', function (data, callback) {

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
         console.log(data);
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
         });*/


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
                console.log(response.body);
                if (error) {
                    socket.broadcast.emit('send:errorBalanceEmail', error, idUser);
                    var returnJson = {
                        status: false,
                        returnObj: error
                    };
                    callback(returnJson);
                    //return returnJson;
                }
                if (response.body == '"Nao foi encontrado creditos para este usuario"' ||
                    response.body == '"parametro invalido"') {
                    socket.emit('send:errorBalanceEmail', response.body, idUser);
                    var returnJson = {
                        status: false,
                        returnObj: response.body
                    };
                    callback(returnJson);

                } else {
                    socket.broadcast.emit('send:sucessBalanceEmail', response.body, idUser);


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