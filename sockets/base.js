var request = require("request");
var striptags = require('striptags');
var aws = require("aws-sdk");
aws.config.loadFromPath(__dirname + '/../config-aws-ses.json');
var ses = new aws.SES();
var clients = [];
var rooms = [];
var AdButler = require("adbutler");
var adbutler = new AdButler({
    'apiKey': 'ebe604963bdb8e8a5ddfa4794dac2563'
});
var zohoToken = "a41d3828cae33450cdd258a46f0e85f6";

var fs = require('fs');

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
            var token = "?api_token="+data.token;
            var url = "http://world.conektta.info/api/credits/" +
                data.id + "/sms" + token;
            request({
                uri: url,
                method: "GET"
            }, function (error, response, body) {
                if (error) {
                    socket.broadcast.emit('send:errorBalanceSms', error, data);
                }
                try{
                    socket.emit('send:sucessBalanceSms', response.body, data);
                }catch (err){
                    socket.broadcast.emit('send:errorBalanceSms', err, data);
                }

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
                var token = "?api_token="+data.token;
                var url = "http://world.conektta.info/api/sms/add" + token;
                console.log(url);
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
                    console.log(body);
                    if (body === "Campanha gravada com sucesso") {

                        smsapi.message
                            .sms()
                            .from(sms.from)
                            .to(sms.to)
                            .message(sms.message)
                            .execute()
                            .then(function (result) {

                                if (result.count > 0) {
                                    var token = "?api_token="+data.token;
                                    var url = "http://world.conektta.info/api/credits/add" + token;
                                    request({
                                        uri: url,
                                        method: "POST",
                                        form: operation
                                    }, function (error, response, body) {
                                        if (error) {
                                            // console.log(error);
                                            callback(error);
                                        }
                                        console.log(body);
                                        if (body == "Dados inseridos com sucesso") {
                                            var dataCreditsAds = {
                                                idUsuer :operation.id_usuario,
                                                token : data.token
                                            };

                                            // Atualiza credito
                                            updateCredits(dataCreditsAds, function (response) {
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
                                console.log(err.error);
                                callback({
                                    success: false,
                                    mensage: "Errro ao gravar campanha"
                                });

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
            var token = "?api_token="+data.token;
            var url = "http://world.conektta.info/api/credits/" +
                data.id + "/sms" + token;
            request = require("request");
            request({
                uri: url,
                method: "GET"
            }, function (error, response, body) {
                if (error) {
                    socket.broadcast.emit('send:errorBalanceSms', error, data);
                }
                try{
                    if (response.body == '"Nao foi encontrado creditos para este usuario"' ||
                        response.body == '"parametro invalido"') {
                        // console.log(">>>ERROR")
                        socket.emit('send:errorBalanceSms', response.body, data);

                    } else {
                        // console.log(response.body);
                        socket.emit('send:sucessBalanceSms', response.body, data);
                    }
                }catch (err){
                    socket.emit('send:errorBalanceSms', err, data);
                }


            })
        });


        var updateCreditsSms = function (idUser, callback) {
            var token = "?api_token="+data.token;
            var url = "http://world.conektta.info/api/credits/" + idUser + "/sms" + token;
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

        socket.on('send:closeTemplate', function (data, callback) {
            socket.broadcast.emit('send:closeTemplate', data);
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
                var token = "?api_token="+data.token;
                var url = "http://world.conektta.info/api/campanhas/add" + token;

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
                                    var token = "?api_token="+data.token;
                                    url = "http://world.conektta.info/api/envios/enviarCampanha" + token;
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
                                            if(responseSendEmail.body === "Sucesso"){
                                                var token = "?api_token="+data.token;
                                                url = "http://world.conektta.info/api/credits/add" + token;

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
                                                    if (bodyCredits == "Dados inseridos com sucess") {

                                                        var dataCreditsAds = {
                                                            idUsuer :operation.id_usuario,
                                                            token : data.token
                                                        };
                                                        updateCreditsEmail(operation.id_usuario, function (response) {
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
            var token = "?api_token="+data.token;
            var url = "http://world.conektta.info/api/credits/" + data.id + "/email" + token;
            request = require("request");
            request({
                uri: url,
                method: "GET"
            }, function (error, response, body) {
                if (error) {
                    socket.broadcast.emit('send:errorBalanceEmail', error, data);
                }
                try{
                    if (response.body == '"Nao foi encontrado creditos para este usuario"' ||
                        response.body == '"parametro invalido"') {
                        // console.log(">>>ERROR")
                        socket.emit('send:errorBalanceEmail', response.body, data);

                    } else {
                        // console.log(response.body);
                        socket.emit('send:sucessBalanceEmail', response.body, data);
                    }
                }catch (err){
                    socket.emit('send:errorBalanceEmail', err, data);
                }

                // socket.emit('send:sucessBalanceEmail',response.body);
                // var jsonres = JSON.parse(response.body);
                // res.json(response.body);
            })
        });

        var updateCredits = function (data, callback) {

            var idUser = data.idUsuer;
            var token = "?api_token="+data.token;

            var url = "http://world.conektta.info/api/credits/" + idUser + "/email" + token;
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

        var updateCreditsEmail = function (idUser, callback) {
            var token = "?api_token="+data.token;
            var url = "http://world.conektta.info/api/credits/" + idUser + "/email" + token;
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


        /////////// ADS /////////

        socket.on('send:balanceAds', function (data) {
            console.log(data);
            // var id_usuario = req.param('idUsuario');
            var token = "?api_token="+data.token;
            var url = "http://world.conektta.info/api/credits/" + data.id + "/adds" + token;
            console.log(url);
            request = require("request");
            request({
                uri: url,
                method: "GET"
            }, function (error, response, body) {
                if (error) {
                    socket.broadcast.emit('send:errorBalanceAds', error, data.id);
                }
                try{
                    if (response.body == '"Nao foi encontrado creditos para este usuario"' ||
                        response.body == '"parametro invalido"') {
                        // console.log(">>>ERROR")
                        socket.emit('send:errorBalanceAds', response.body, data.id);

                    } else {
                        // console.log(response.body);
                        socket.emit('send:sucessBalanceAds', response.body, data.id);
                    }
                }catch (err){
                    socket.emit('send:errorBalanceAds', err, data);
                }


            })
        });

        /////// ADS

        socket.on('send:createAds', function (data, callback) {
            var file = data.adbutler.fileBanner;
            console.log(data.adbutler.fileBanner);
            console.log(data.typeBanner);
            if(data.typeBanner === 'imageBanner'){
                imageBanner(data.adbutler, function (imageBannerRes) {

                    if(imageBannerRes.adbutlerRes){

                        insertRecords(data.zoho, function (insertRecordsRes) {

                            if(insertRecordsRes.insertRecordsRes){
                                var dataDebit = {
                                    operation : data.operation,
                                    token : data.token
                                };
                                debitCredit(dataDebit,function (debitCreditRes) {
                                    console.log(debitCreditRes);
                                    if(debitCreditRes.debitCreditRes){
                                        var dataCreditsAds = {
                                            idUsuer :data.idUsuer,
                                            token : data.token
                                        }
                                        updateCredits(dataCreditsAds, function (response) {
                                            // console.log(response);
                                            if (response.status) {
                                                callback({
                                                    success: true,
                                                    mensage: response.status,
                                                    user: data.idUsuer
                                                });
                                            }
                                        })
                                    }else{
                                        callback({
                                            success: false,
                                            mensage: "Erro ao publicar campanha"
                                        });
                                    }
                                });

                            }else{
                                callback({
                                    success: false,
                                    mensage: "Erro ao publicar campanha"
                                });
                            }
                        })

                    }else{
                        callback({
                            success: false,
                            mensage: "Erro ao publicar campanha"
                        });
                    };

                })
            }else if(data.typeBanner === 'richMediaBanner'){
                richMediaBanner(data.adbutler, function (richMediaBannerRes) {

                    if(richMediaBannerRes.adbutlerRes){

                        insertRecords(data.zoho, function (insertRecordsRes) {

                            if(insertRecordsRes.insertRecordsRes){
                                var dataDebit = {
                                    operation : data.operation,
                                    token : data.token
                                };
                                debitCredit(dataDebit,function (debitCreditRes) {
                                    console.log(debitCreditRes);
                                    if(debitCreditRes.debitCreditRes){
                                        var dataCreditsAds = {
                                            idUsuer :data.idUsuer,
                                            token : data.token
                                        };
                                        updateCredits(dataCreditsAds, function (response) {
                                            // console.log(response);
                                            if (response.status) {
                                                callback({
                                                    success: true,
                                                    mensage: response.status,
                                                    user: data.idUsuer
                                                });
                                            }
                                        })
                                    }else{
                                        callback({
                                            success: false,
                                            mensage: "Erro ao publicar campanha"
                                        });
                                    }
                                });

                            }else{
                                callback({
                                    success: false,
                                    mensage: "Erro ao publicar campanha"
                                });
                            }
                        })

                    }else{
                        callback({
                            success: false,
                            mensage: "Erro ao publicar campanha"
                        });
                    };

                })
            }

        });

        var imageBanner = function (adbutlerJson, callback) {
            var mediaGroupID = 12409;  // NOTE: use te media group ID that exists in your account
            var fileBanner = adbutlerJson.fileBanner;


            adbutler.creatives.images.create({
                "group": mediaGroupID,
                "name": adbutlerJson.name,
                "description": adbutlerJson.description.toString(),
                "file": fileBanner
            }).then(function (creativeImage) {
                // Creating a rich media banner
                adbutler.banners.images.create({
                    "name": adbutlerJson.name,
                    "width": 300,
                    "height": 250,
                    "creative": creativeImage.id
                }).then(function (bannerImages) {
                    // Creating a banner campaign
                    console.log(bannerImages);
                    adbutler.campaigns.banners.create({
                        "advertiser": adbutlerJson.advertiserID,
                        "height": 250,
                        "name": adbutlerJson.name,
                        "width": 300
                    }).then(function (bannerCampaign) {
                        // Assigning banner to the campaign
                        console.log(bannerCampaign);
                        adbutler.campaignAssignments.create({
                            "campaign": bannerCampaign.id,
                            "advertisement": {
                                id: bannerImages.id,
                                type: "banner"
                            }
                        }, function (error, response) {
                            fs.exists(fileBanner, function (exists) {
                                if (exists) {
                                    //Show in green
                                    fs.unlink(fileBanner);
                                } else {
                                    //Show in red
                                }
                            });
                            /////// Success
                            callback({adbutlerRes:true});

                        });
                    }).catch(function (bannerCampaignError) {
                        console.log("bannerCampaignError");
                        console.log(bannerCampaignError);
                        callback({adbutlerRes:false,error:bannerCampaignError});
                       // res.json({success: false, reponse: bannerCampaignError});

                    });
                }).catch(function (bannerImagesError) {
                    console.log("bannerImagesError");
                    console.log(bannerImagesError);
                    callback({adbutlerRes:false,error:bannerImagesError});
                   // res.json({success: false, reponse: bannerImagesError});
                });
            }).catch(function (creativeImageError) {
                console.log("creativeImageError");
                console.log(creativeImageError);
                callback({adbutlerRes:false,error:creativeImageError});
                //res.json({success: false, reponse: creativeImageError});
            });
        };

        var richMediaBanner = function (adbutlerJson, callback) {
            var mediaGroupID = 12409;  // NOTE: use te media group ID that exists in your account
            var fileBanner = adbutlerJson.fileBanner;


            adbutler.creatives.richMedia.create({
                "group": mediaGroupID,
                "name": adbutlerJson.name,
                "description": adbutlerJson.description.toString(),
                "file": fileBanner
            }).then(function (creativeRichMedia) {
                // Creating a rich media banner
                adbutler.banners.richMedia.create({
                    "name": adbutlerJson.name,
                    "width": 300,
                    "height": 250,
                    "creative": creativeRichMedia.id
                }).then(function (bannerRichMedia) {
                    // Creating a banner campaign
                    console.log(bannerRichMedia);
                    adbutler.campaigns.banners.create({
                        "advertiser": adbutlerJson.advertiserID,
                        "height": 250,
                        "name": adbutlerJson.name,
                        "width": 300
                    }).then(function (bannerCampaign) {
                        // Assigning banner to the campaign
                        console.log(bannerCampaign);
                        adbutler.campaignAssignments.create({
                            "campaign": bannerCampaign.id,
                            "advertisement": {
                                id: bannerRichMedia.id,
                                type: "banner"
                            }
                        }, function (error, response) {
                            fs.exists(fileBanner, function (exists) {
                                if (exists) {
                                    //Show in green
                                    fs.unlink(fileBanner);
                                } else {
                                    //Show in red
                                }
                            });
                            /////// Success
                            callback({adbutlerRes:true});

                        });
                    }).catch(function (bannerCampaignError) {
                        callback({adbutlerRes:false,error:bannerCampaignError});
                        // res.json({success: false, reponse: bannerCampaignError});

                    });
                }).catch(function (bannerRichMediaError) {
                    callback({adbutlerRes:false,error:bannerRichMediaError});
                    // res.json({success: false, reponse: bannerImagesError});
                });
            }).catch(function (creativeRichMediaError) {
                callback({adbutlerRes:false,error:creativeRichMediaError});
                //res.json({success: false, reponse: creativeImageError});
            });;
        };


        var insertRecords = function (zohoJson,callback) {
            console.log("insertRecords");
            console.log(zohoJson);
            var xml = "";
            if (zohoJson.zonas) {
                xml = "<CustomModule2>" +
                    "<row no='1'>" +
                    "<FL val='Usuario Conektta'>" + zohoJson.usuario + "</FL>" +
                    "<FL val='Nome'>" + zohoJson.nome + "</FL>" +
                    "<FL val='ID Adbutler'>" + zohoJson.id_Adbutler + "</FL>" +
                    "<FL val='Views'>" + zohoJson.views + "</FL>" +
                    "<FL val='Canal'>" + zohoJson.canal + "</FL>" +
                    "<FL val='Zonas'>" + zohoJson.zonas + "</FL>" +
                    "</row>" +
                    "</CustomModule2>"
            } else {
                xml = "<CustomModule2>" +
                    "<row no='1'>" +
                    "<FL val='Usuario Conektta'>" + zohoJson.usuario + "</FL>" +
                    "<FL val='Nome'>" + zohoJson.nome + "</FL>" +
                    "<FL val='ID Adbutler'>" + zohoJson.id_Adbutler + "</FL>" +
                    "<FL val='Views'>" + zohoJson.views + "</FL>" +
                    "<FL val='Canal'>" + zohoJson.canal + "</FL>"+
                    "</row>" +
                    "</CustomModule2>"
            }
            var url = "https://crm.zoho.com/crm/private/json/CustomModule2/insertRecords?authtoken=" + zohoToken +
                "&scope=crmapi&newFormat=1&xmlData=" + xml;

            request({
                uri: url,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                }

            }, function (error, response, body) {

                if (error) {
                    callback({insertRecordsRes:false,error:error});
                    //res.json({success: false, reponse: error}) ;
                }
                console.log(body);
                callback({insertRecordsRes:true})
            });

        };

        var debitCredit = function (data, callback) {
            var operation = data.operation;
            console.log(data);
            var token = "?api_token="+data.token;
            var url = "http://world.conektta.info/api/credits/add" + token;
            request({
                uri: url,
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                form:operation[0]
            }, function(errorCredits, responseCredits, bodyCredits) {
                if (errorCredits) {

                    callback({debitCreditRes:false});
                }
                console.log(bodyCredits);
                if (bodyCredits == "Dados inseridos com sucesso") {

                    callback({debitCreditRes:true});

                }else{
                    callback({debitCreditRes:false});
                }

            });
        };

        var updateCreditsAds = function (data, callback) {
            var idUser = data.idUsuer;
            var token = "?api_token="+data.token;
            var url = "http://world.conektta.info/api/credits/" + idUser + "/adds" + token;
            console.log(url);
            request = require("request");
            request({
                uri: url,
                method: "GET"
            }, function (error, response, body) {
                if (error) {
                    socket.broadcast.emit('send:errorBalanceAds', error, idUser);
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
                    socket.emit('send:errorBalanceAds', response.body, idUser);
                    var returnJson = {
                        status: false,
                        returnObj: response.body
                    };
                    callback(returnJson);

                } else {
                    try {
                        socket.emit('send:sucessBalanceAds', response.body, idUser);
                        socket.broadcast.emit('send:sucessBalanceAds', response.body, idUser);
                        var returnJson = {
                            status: true,
                            returnObj: response.body
                        };
                        callback(returnJson);
                    }catch (err){
                        console.log(err);
                        socket.emit('send:errorBalanceAds', err, idUser);
                    }


                }

            })
        };


    });


};