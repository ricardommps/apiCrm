var request = require("request");
var striptags = require('striptags');
var aws = require("aws-sdk");
var fs = require('fs');
var http = require('http');
var Stream = require('stream').Transform;
var config = require('../config.json');
var SMSAPI = require('smsapicom');
var AdButler = require("adbutler");

aws.config.loadFromPath(__dirname + '/../config-aws-ses.json');
var ses = new aws.SES();
var clients = [];
var rooms = [];
var adbutler = new AdButler({
    'apiKey': 'ebe604963bdb8e8a5ddfa4794dac2563'
});
var zohoToken = "a41d3828cae33450cdd258a46f0e85f6";
var pathname = '';
var smsapi = new SMSAPI();
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


        socket.on('send:sendSms', function (data, callback) {
            var operation = data.operation[0];
            var create = data.create[0];
            var credits = data.credits;
            var sms = data.sms[0];
            var jsonReturn = {};

            if (create.Message.cost < credits) {
                var token = "?api_token=" + data.token;
                pathname = 'sms/add';
                var url = config.word_url + pathname + token;
                //var url = "http://world.conektta.info/api/sms/add" + token;
                request({
                    uri: url,
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    },
                    form: create
                }, function (error, response, body) {
                    if (error) {
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
                                    var token = "?api_token=" + data.token;
                                    pathname = 'credits/add';
                                    var url = config.word_url + pathname + token;
                                    //var url = "http://world.conektta.info/api/credits/add" + token;
                                    request({
                                        uri: url,
                                        method: "POST",
                                        form: operation
                                    }, function (error, response, body) {
                                        if (error) {
                                            callback(error);
                                        }
                                        if (body == "Dados inseridos com sucesso") {
                                            var dataCreditsAds = {
                                                idUsuer: operation.id_usuario,
                                                token: data.token
                                            };

                                            // Atualiza credito
                                            updateCredits(dataCreditsAds, function (response) {
                                                //console.log(response);
                                                if (response.status) {
                                                    callback(response.status);
                                                }
                                            })
                                        } else {
                                            callback("Error");
                                        }
                                    });

                                } else {
                                    //console.log("error");
                                    //console.log(result);
                                }

                            })
                            .catch(function (err) {
                               // console.log(err.error);
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
                var token = "?api_token=" + data.token;
                pathname = 'campanhas/add';
                var url = config.word_url + pathname + token;
                // var url = "http://world.conektta.info/api/campanhas/add" + token;

                request({
                    uri: url,
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    },
                    form: create
                }, function (error, response, body) {
                    //console.log(error);
                    if (error) {
                        callback({
                            success: false,
                            mensage: error
                        });
                    }
                    //console.log(">>>> 1 <<<<");
                    //console.log(response.body);
                    try {
                        var campanha = JSON.parse(response.body);

                        //url = "https://api.elasticemail.com/template/add?version=2";
                        url = config.elasticemail_url;
                        request({
                            uri: url,
                            method: "POST",
                            headers: {
                                "content-type": "application/json"
                            },
                            form: template
                        }, function (errorTemplate, responseTemplate, bodyTemplate) {
                            if (errorTemplate) {
                                callback({
                                    success: false,
                                    mensage: errorTemplate
                                });
                            }
                          //  console.log(">>>> 2 <<<<");
                            //console.log(bodyTemplate);
                            try {
                                var templateJson = JSON.parse(bodyTemplate);
                                //  console.log(templateJson);
                                if (templateJson.success) {
                                    var sendEmail = {
                                        id_campanha: campanha.id,
                                        id_template: templateJson.data
                                    };
                                    // console.log(sendEmail);
                                    var token = "?api_token=" + data.token;
                                    pathname = 'envios/enviarCampanha';
                                    url = config.word_url + pathname + token;
                                    //url = "http://world.conektta.info/api/envios/enviarCampanha" + token;
                                    request({
                                        uri: url,
                                        method: "POST",
                                        headers: {
                                            "content-type": "application/json"
                                        },
                                        form: sendEmail
                                    }, function (errorSendEmail, responseSendEmail, bodySendEmail) {
                                        if (errorSendEmail) {
                                            callback({
                                                success: false,
                                                mensage: errorTemplate
                                            });
                                        }
                                       // console.log(">>>> 3 <<<<");
                                       // console.log(responseSendEmail.body);
                                        try {
                                            if (responseSendEmail.body === "Sucesso") {
                                                var token = "?api_token=" + data.token;
                                                pathname = 'credits/add';
                                                url = config.word_url + pathname + token;
                                                // url = "http://world.conektta.info/api/credits/add" + token;

                                                request({
                                                    uri: url,
                                                    method: "POST",
                                                    headers: {
                                                        "content-type": "application/json"
                                                    },
                                                    form: operation
                                                }, function (errorCredits, responseCredits, bodyCredits) {
                                                    if (errorCredits) {
                                                        callback({
                                                            success: true,
                                                            mensage: "Erro ao enviar email"
                                                        });
                                                    }
                                                  //  console.log(">>>> 4 <<<<");
                                                  //  console.log(bodyCredits);
                                                    if (bodyCredits == "Dados inseridos com sucess") {

                                                        var dataCreditsAds = {
                                                            idUsuer: operation.id_usuario,
                                                            token: data.token
                                                        };
                                                        updateCredits(operation.id_usuario, function (response) {
                                                          //  console.log(">>>> 5 <<<<");
                                                          //  console.log(response);
                                                            if (response.status) {
                                                                callback({
                                                                    success: true,
                                                                    mensage: response.status
                                                                });
                                                                //callback(response.status);
                                                            } else {
                                                                callback({
                                                                    success: false,
                                                                    mensage: "Erro ao enviar email"
                                                                });
                                                            }
                                                        });

                                                    } else {
                                                        callback({
                                                            success: false,
                                                            mensage: "Erro ao enviar email"
                                                        });
                                                    }


                                                });
                                            } else {
                                                callback({
                                                    success: false,
                                                    mensage: "Erro ao enviar email"
                                                });
                                            }
                                        } catch (er) {
                                            callback({
                                                success: false,
                                                mensage: "Erro ao enviar email"
                                            });
                                        }

                                    })
                                } else {
                                    callback({
                                        success: false,
                                        mensage: "Erro ao enviar email"
                                    });
                                }

                            } catch (e) {
                                callback({
                                    success: false,
                                    mensage: "Erro ao enviar email"
                                });
                            }

                        })

                    } catch (err) {
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

        socket.on('send:balanceEmail', function (data) {
            var token = "?api_token=" + data.token;
            pathname = 'credits/';
            var url = config.word_url + pathname + data.id + "/email" + token;
            //var url = "http://world.conektta.info/api/credits/" + data.id + "/email" + token;
            request = require("request");
            request({
                uri: url,
                method: "GET"
            }, function (error, response, body) {
                if (error) {
                    socket.broadcast.emit('send:errorBalanceEmail', error, data);
                }
                try {
                    if (response.body == '"Nao foi encontrado creditos para este usuario"' ||
                        response.body == '"parametro invalido"') {
                        // console.log(">>>ERROR")
                        socket.emit('send:errorBalanceEmail', response.body, data);

                    } else {
                        // console.log(response.body);
                        socket.emit('send:sucessBalanceEmail', response.body, data);
                    }
                } catch (err) {
                    socket.emit('send:errorBalanceEmail', err, data);
                }

            })
        });

        var updateCredits = function (data, callback) {
            console.log(">>>updateCredits<<<");
            var idUser = data.idUsuer;
            var token = "?api_token=" + data.token;
            pathname = 'credits/';
            var url = config.word_url + pathname + idUser + "/email" + token;

            //var url = "http://world.conektta.info/api/credits/" + idUser + "/email" + token;
            //console.log(url);
            request = require("request");
            request({
                uri: url,
                method: "GET"
            }, function (error, response, body) {
                //console.log(">>> 1 -- updateCredits<<<");
                //console.log(response.body);
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
                    socket.emit('send:sucessBalanceEmail', response.body, idUser);

                    var returnJson = {
                        status: true,
                        returnObj: response.body
                    };
                    callback(returnJson);
                }

            })
        };


        /////////// ADS /////////


        /////// ADS

        socket.on('send:createAdsImageBanner', function (data, callback) {
            saveImage(data.adbutler, function (saveImageRes) {
                if (saveImageRes.saveImage) {
                    imageBannerVs2(data.adbutler,saveImageRes.fileBanner, function (imageBannerRes) {
                        if (imageBannerRes.adbutlerRes) {
                            data.zoho.id_Adbutler = imageBannerRes.campaignID;
                            insertRecords(data.zoho, function (insertRecordsRes) {
                                if (insertRecordsRes.insertRecordsRes) {
                                    var dataDebit = {
                                        operation: data.operation,
                                        token: data.token
                                    };
                                    debitCredit(dataDebit, function (debitCreditRes) {
                                        if (debitCreditRes.debitCreditRes) {
                                            var dataCreditsAds = {
                                                idUsuer: data.idUsuer,
                                                token: data.token
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
                                        } else {
                                            callback({
                                                success: false,
                                                mensage: "Erro ao publicar campanha"
                                            });
                                        }
                                    });
                                } else {
                                    callback({
                                        success: false,
                                        mensage: "Erro ao publicar campanha"
                                    });
                                }
                            });
                        } else {
                            callback({
                                success: false,
                                mensage: "Erro ao publicar campanha"
                            });
                        }
                    });
                } else {
                    callback({
                        success: false,
                        mensage: "Erro ao publicar campanha"
                    });
                }
            });
        });

        socket.on('send:createAds', function (data, callback) {
            var file = data.adbutler.fileBanner;
            if (data.typeBanner === 'imageBanner') {
                imageBanner(data.adbutler, function (imageBannerRes) {
                    if (imageBannerRes.adbutlerRes) {
                        data.zoho.id_Adbutler = imageBannerRes.campaignID;
                        insertRecords(data.zoho, function (insertRecordsRes) {

                            if (insertRecordsRes.insertRecordsRes) {
                                var dataDebit = {
                                    operation: data.operation,
                                    token: data.token
                                };
                                debitCredit(dataDebit, function (debitCreditRes) {
                                    if (debitCreditRes.debitCreditRes) {
                                        var dataCreditsAds = {
                                            idUsuer: data.idUsuer,
                                            token: data.token
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
                                    } else {
                                        callback({
                                            success: false,
                                            mensage: "Erro ao publicar campanha"
                                        });
                                    }
                                });

                            } else {
                                callback({
                                    success: false,
                                    mensage: "Erro ao publicar campanha"
                                });
                            }
                        })

                    } else {
                        callback({
                            success: false,
                            mensage: "Erro ao publicar campanha"
                        });
                    }
                    ;

                })
            } else if (data.typeBanner === 'richMediaBanner') {
                richMediaBanner(data.adbutler, function (richMediaBannerRes) {

                    if (richMediaBannerRes.adbutlerRes) {

                        insertRecords(data.zoho, function (insertRecordsRes) {

                            if (insertRecordsRes.insertRecordsRes) {
                                var dataDebit = {
                                    operation: data.operation,
                                    token: data.token
                                };
                                debitCredit(dataDebit, function (debitCreditRes) {
                                    if (debitCreditRes.debitCreditRes) {
                                        var dataCreditsAds = {
                                            idUsuer: data.idUsuer,
                                            token: data.token
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
                                    } else {
                                        callback({
                                            success: false,
                                            mensage: "Erro ao publicar campanha"
                                        });
                                    }
                                });

                            } else {
                                callback({
                                    success: false,
                                    mensage: "Erro ao publicar campanha"
                                });
                            }
                        })

                    } else {
                        callback({
                            success: false,
                            mensage: "Erro ao publicar campanha"
                        });
                    };

                })
            }

        });

        var saveImage = function (adbutlerJson, callback) {
            var fileName = adbutlerJson.idImage + ".png";
            var path = './downloads/';

            http.request(adbutlerJson.linkImage, function (response) {
                var data = new Stream();

                response.on('data', function (chunk) {
                    data.push(chunk);
                });

                response.on('end', function () {
                    fs.writeFile(path, data.read(), function (err) {
                        if (err) {
                            callback({saveImage: false});
                        } else {
                            callback({
                                saveImage: true,
                                fileBanner: path + fileName
                            });
                        }
                    });
                });
            });
        };

        var imageBannerVs2 = function (adbutlerJson, fileBanner, callback ) {
            var mediaGroupID = 12409;  // NOTE: use te media group ID that exists in your account
            var fileBanner = fileBanner;
            adbutler.creatives.images.create({
                "group": mediaGroupID,
                "name": adbutlerJson.name,
                "description": adbutlerJson.description.toString(),
                "file": fileBanner
            }).then(function (creativeImage) {
                adbutler.banners.images.create({
                    "name": adbutlerJson.name,
                    "width": 300,
                    "height": 250,
                    "creative": creativeImage.id
                }).then(function (bannerImage) {
                    adbutler.campaigns.banners.create({
                        "advertiser": adbutlerJson.advertiserID,
                        "width": 300,
                        "height": 250,
                        "name": adbutlerJson.name
                    }).then(function (bannerCampaign) {
                        adbutler.campaignAssignments.create({
                            "campaign": {
                                id: bannerCampaign.id,
                                type: "banner_campaign"
                            },
                            "advertisement": {
                                id: bannerImage.id,
                                type: "image_banner"
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
                            callback({adbutlerRes: true, campaignID: bannerCampaign.id});
                        });
                    }).catch(function (bannerCampaignError) {
                        callback({adbutlerRes: false, error: bannerCampaignError});
                    })
                }).catch(function (bannerImagesError) {
                    callback({adbutlerRes: false, error: bannerImagesError});
                })
            }).catch(function (creativeImageError) {
                callback({adbutlerRes: false, error: creativeImageError});
            });
        };

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
                    adbutler.campaigns.banners.create({
                        "advertiser": adbutlerJson.advertiserID,
                        "height": 250,
                        "name": adbutlerJson.name,
                        "width": 300
                    }).then(function (bannerCampaign) {
                        // Assigning banner to the campaign
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
                            callback({adbutlerRes: true, campaignID: bannerCampaign.id});

                        });
                    }).catch(function (bannerCampaignError) {
                        callback({adbutlerRes: false, error: bannerCampaignError});
                        // res.json({success: false, reponse: bannerCampaignError});

                    });
                }).catch(function (bannerImagesError) {
                    callback({adbutlerRes: false, error: bannerImagesError});
                    // res.json({success: false, reponse: bannerImagesError});
                });
            }).catch(function (creativeImageError) {
                callback({adbutlerRes: false, error: creativeImageError});
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
                    adbutler.campaigns.banners.create({
                        "advertiser": adbutlerJson.advertiserID,
                        "height": 250,
                        "name": adbutlerJson.name,
                        "width": 300
                    }).then(function (bannerCampaign) {
                        // Assigning banner to the campaign
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
                            callback({adbutlerRes: true});

                        });
                    }).catch(function (bannerCampaignError) {
                        callback({adbutlerRes: false, error: bannerCampaignError});
                        // res.json({success: false, reponse: bannerCampaignError});

                    });
                }).catch(function (bannerRichMediaError) {
                    callback({adbutlerRes: false, error: bannerRichMediaError});
                    // res.json({success: false, reponse: bannerImagesError});
                });
            }).catch(function (creativeRichMediaError) {
                callback({adbutlerRes: false, error: creativeRichMediaError});
                //res.json({success: false, reponse: creativeImageError});
            });
        };


        var insertRecords = function (zohoJson, callback) {
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
                    "<FL val='Canal'>" + zohoJson.canal + "</FL>" +
                    "</row>" +
                    "</CustomModule2>"
            }
            var url = config.zoho_url + zohoToken + "&scope=crmapi&newFormat=1&xmlData=" + xml;

            /*var url = "https://crm.zoho.com/crm/private/json/CustomModule2/insertRecords?authtoken=" + zohoToken +
             "&scope=crmapi&newFormat=1&xmlData=" + xml;*/

            request({
                uri: url,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                }

            }, function (error, response, body) {

                if (error) {
                    callback({insertRecordsRes: false, error: error});
                    //res.json({success: false, reponse: error}) ;
                }
                callback({insertRecordsRes: true})
            });

        };

        var debitCredit = function (data, callback) {
            var operation = data.operation;
            var token = "?api_token=" + data.token;
            pathname = 'credits/add';
            var url = config.word_url + pathname + token;
            //var url = "http://world.conektta.info/api/credits/add" + token;
            request({
                uri: url,
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                form: operation[0]
            }, function (errorCredits, responseCredits, bodyCredits) {
                if (errorCredits) {

                    callback({debitCreditRes: false});
                }
                //console.log(bodyCredits);
                if (bodyCredits == "Dados inseridos com sucesso") {

                    callback({debitCreditRes: true});

                } else {
                    callback({debitCreditRes: false});
                }

            });
        };

    });


};