var express = require('express');
var router = express.Router();
var io = require('../app');
var fs = require('fs');
var http = require('http');
var Stream = require('stream').Transform;
var request = require("request");
var AdButler = require("adbutler");
var async = require('async');
var moment = require('moment');
var adbutler = new AdButler({
    'apiKey': 'ebe604963bdb8e8a5ddfa4794dac2563'
});
var config = require('../config.json');
var zohoToken = "a41d3828cae33450cdd258a46f0e85f6";

var createSchedules = function (schedulesJson, callback) {
    console.log(schedulesJson.start_date);
    if(moment(schedulesJson.start_date, "YYYY-MM-DD").isValid()){
        console.log("-----------IF-------");
        adbutler.schedules.create({
            "delivery_method": "default",
            "start_date": "2017-06-28 14:00:00",
            "end_date": "2017-06-29 14:00:00",

        }).then(function (schedules) {
            console.log(schedules);
            callback({schedulesRes: true, schedules:schedules});
        }).catch(function (schedulesError) {
            console.log(schedulesError);
            callback({schedulesRes: false});
        });
    }else{
        console.log("-----------ELSE-------");
        adbutler.schedules.create({
            "delivery_method": "default",
        }).then(function (schedules) {
            console.log(schedules);
            callback({schedulesRes: true, schedules:schedules});
        }).catch(function (schedulesError) {
            console.log(schedulesError);
            callback({schedulesRes: false});
        });
    }

}

var imageBannerVs2 = function (adbutlerJson, fileBanner, callback) {

    var mediaGroupID = 12409;  // NOTE: use te media group ID that exists in your account

    adbutler.creatives.images.create({
        "group": mediaGroupID,
        "name": adbutlerJson.name,
        "description": adbutlerJson.description.toString(),
        "file": fileBanner
    }).then(function (creativeImage) {
        adbutler.banners.images.create({
            "name": adbutlerJson.name,
            "width": 350,
            "height": 400,
            "creative": creativeImage.id
        }).then(function (bannerImage) {
            adbutler.campaigns.banners.create({
                "advertiser": adbutlerJson.advertiserID,
                "width": 350,
                "height": 400,
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
                    if(error){
                        fs.exists(fileBanner, function (exists) {
                            if (exists) {
                                //Show in green
                                fs.unlink(fileBanner);
                            } else {
                                //Show in red
                            }
                        });
                        callback({adbutlerRes: false, error: error});
                    }else{
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
                    }

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

var saveImage = function (adbutlerJson, callback) {

    var fileName = "";
    var path = "";

    if(adbutlerJson.fileBanner){
        path = './uploads/'+adbutlerJson.fileBanner;
        callback({
            saveImage: true,
            fileBanner: path
        });
    }else{
        fileName = adbutlerJson.idImage + ".png";
        path = './uploads/';
        path = path + fileName;
        console.log("<<<<path>>>>");
        console.log(path);
        http.request(adbutlerJson.linkImage, function (response) {
            console.log(">>>request<<<");
            console.log(response);
            var data = new Stream();

            response.on('data', function (chunk) {
                data.push(chunk);
            });

            response.on('end', function () {
                fs.writeFile(path, data.read(), function (err) {
                    if (err) {
                        console.log(err);
                        callback({saveImage: false});
                    } else {
                        console.log("success save");
                        callback({
                            saveImage: true,
                            fileBanner: path
                        });
                    }
                });
            });
        }).end();
    }




};


var insertRecords = function (zohoJson, callback) {
    var xml = "";
    var lifetime_dates = "No date restrictions ";
    if(moment(zohoJson.start_date, "YYYY-MM-DD").isValid()){
        lifetime_dates = "Use date range";
    };
    console.log(lifetime_dates);
    xml = "<CustomModule2>" +
        "<row no='1'>" +
        "<FL val='Usuario Conektta'>" + zohoJson.usuario + "</FL>" +
        "<FL val='Nome'>" + zohoJson.nome + "</FL>" +
        "<FL val='ID Adbutler'>" + zohoJson.id_Adbutler + "</FL>" +
        "<FL val='Zonas'>" + zohoJson.zonas + "</FL>" +
        "<FL val='Metodo de Entrega'>" + zohoJson.delivery_method + "</FL>" +
        "<FL val='Periodo'>" + lifetime_dates + "</FL>" +
        "<FL val='Data Inicio'>" + zohoJson.start_date + "</FL>" +
        "<FL val='Hora Inicio'>" + zohoJson.start_hour + "</FL>" +
        "<FL val='Data Fim'>" + zohoJson.end_date + "</FL>" +
        "<FL val='Hora Fim'>" + zohoJson.end_hour + "</FL>" +
        "<FL val='Metodo Cobranca'>" + zohoJson.billingMethod + "</FL>" +
        "<FL val='Custo CPM'>" + zohoJson.costCpm + "</FL>" +
        "<FL val='Orcamento Diario'>" + zohoJson.dailyBudget + "</FL>" +
        "<FL val='Limite Usuario Entrega'>" + zohoJson.per_user_view_limit + "</FL>" +
        "<FL val='Limite Usuario Dia'>" + zohoJson.per_user_view_period + "</FL>" +
        "</row>" +
        "</CustomModule2>"
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
        console.log(body);
        if (error) {
            callback({insertRecordsRes: false, error: error});
            //res.json({success: false, reponse: error}) ;
        }
        callback({insertRecordsRes: true})
    });

};

router.get('/campaignsList', function (req, res, next) {

    var token = "?api_token=" + global.token;
    var id_user = req.query.id_user;
    var pathname = 'consultas/ads/';
    var url = config.word_url + pathname + id_user + token;
    request({
        uri: url,
        method: "GET"
    }, function (error, response, body) {
        if (error) {
            res.send(error);
            return;
        }
        try {
            if (response.body === '"Sem registros para esse usuario"') {
                res.json({success: true, response: response.body});
            } else {
                res.json({success: true, response: JSON.parse(response.body)});
            }

        } catch (err) {
            res.json({success: false});
            return;
        }

    })

});

router.post('/stats', function (req, res, next) {

    var settings = req.body;

    adbutler.stats.read(settings)
        .then(function (stats) {
            res.json({success: true, response: stats});
        })
        .catch(function (statsError) {
            // console.log(statsError);
            res.json({success: false, response: statsError});
        });


});

router.post('/createAds', function (req, res, next) {
    var data = req.body;
    console.log(data);

    saveImage(data.adbutler, function (saveImageRes) {
        console.log("-*-*-*-*-*-*-*");
        console.log(saveImageRes);
        if (saveImageRes.saveImage) {
            console.log(saveImageRes);
            imageBannerVs2(data.adbutler, saveImageRes.fileBanner, function (imageBannerRes) {
                if (imageBannerRes.adbutlerRes) {
                    createSchedules(data.schedules , function (schedulesRes) {
                        console.log(schedulesRes);
                    })
                }
            });
        }
    });


    /*saveImage(data.adbutler, function (saveImageRes) {
        console.log(saveImageRes);
    })*/;

    /*insertRecords(data.zoho, function (insertRecordsRes) {
        console.log(insertRecordsRes);
    });*/
    res.send("ok");

});


module.exports = router;