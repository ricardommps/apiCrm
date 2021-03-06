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


var placements = function (placementsJson, schedule, imageBannerId, callback) {
    //console.log(">>>> placements <<<<");
    //console.log(schedule);
    var inserted = 0;
    var zone = 0;
    var data = {};
    var placementsArray = [];
    for (var i = 0; i < placementsJson.zone.length; i++) {
        zone = parseInt(placementsJson.zone[i].id, 10);
        if (placementsJson.per_user_view_limit == 0) {
            data = {
                "active": true,
                "schedule": schedule,
                "advertisement": {
                    id: imageBannerId,
                    type: "banner_campaign"
                },
                "zone": {
                    id: zone,
                    type: "banner_zone"
                },
                "cost": {
                    cpm: placementsJson.cost.cpm,
                    cpc: 0.0,
                    cpa: 0.0
                }
            }
        } else {
            data = {
                "active": true,
                "schedule": schedule,
                "advertisement": {
                    id: imageBannerId,
                    type: "banner_campaign"
                },
                "zone": {
                    id: zone,
                    type: "banner_zone"
                },
                "per_user_view_limit": placementsJson.per_user_view_limit,
                "per_user_view_period": placementsJson.per_user_view_period,
                "cost": {
                    cpm: placementsJson.cost.cpm,
                    cpc: 0.0,
                    cpa: 0.0
                }
            }
        }

        adbutler.placements.create(data).then(function (placements) {
            placementsArray.push(placements.id);
            if (++inserted == placementsJson.zone.length) {
                callback({placementsRes: true, placements: placementsArray});
            }

        }).catch(function (placementsError) {
            callback({placementsRes: false, error: placementsError});
            return;
        });
    }

}

var createSchedules = function (schedulesJson, callback) {
    //console.log(schedulesJson.start_date);
    if (moment(schedulesJson.start_date, "YYYY-MM-DD").isValid()) {
        //console.log("-----------IF-------");
        adbutler.schedules.create({
            "delivery_method": "default",
            "start_date": schedulesJson.start_date,
            "end_date": schedulesJson.end_date
        }).then(function (schedules) {
            //console.log(schedules);
            callback({schedulesRes: true, schedules: schedules});
        }).catch(function (schedulesError) {
            //console.log(schedulesError);
            callback({schedulesRes: false});
        });
    } else {
        //console.log("-----------ELSE-------");
        adbutler.schedules.create({
            "delivery_method": "default",
        }).then(function (schedules) {
            callback({schedulesRes: true, schedules: schedules});
        }).catch(function (schedulesError) {
            callback({schedulesRes: false, error: schedulesError});
        });
    }

}

var imageBannerVs2 = function (adbutlerJson, fileBanner, callback) {

    var mediaGroupID = 12409;  // NOTE: use te media group ID that exists in your account
    //console.log(">>>.adbutlerJson<<<<");
   // console.log(adbutlerJson);
    adbutler.creatives.images.create({
        "group": mediaGroupID,
        "name": adbutlerJson.name,
        "description": adbutlerJson.description.toString(),
        "file": fileBanner
    }).then(function (creativeImage) {
        var adbutlerData = {};
        try{
            if(adbutlerJson.url || adbutlerJson.url.length > 0){
                adbutlerData =  {
                    "name": adbutlerJson.name,
                    "width": 350,
                    "height": 400,
                    "creative": creativeImage.id,
                    "location" : adbutlerJson.url
                }
            }else{
                adbutlerData =  {
                    "name": adbutlerJson.name,
                    "width": 350,
                    "height": 400,
                    "creative": creativeImage.id,
                }
            }
        }catch (err){
            adbutlerData =  {
                "name": adbutlerJson.name,
                "width": 350,
                "height": 400,
                "creative": creativeImage.id,
            }
        }

        adbutler.banners.images.create(adbutlerData).then(function (bannerImage) {
            //console.log(bannerImage);
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
                    active: false,
                    "advertisement": {
                        id: bannerImage.id,
                        type: "image_banner"
                    }
                }, function (error, response) {
                    if (error) {
                        fs.exists(fileBanner, function (exists) {
                            if (exists) {
                                //Show in green
                                fs.unlink(fileBanner);
                            } else {
                                //Show in red
                            }
                        });
                        callback({adbutlerRes: false, error: error});
                    } else {
                        fs.exists(fileBanner, function (exists) {
                            if (exists) {
                                //Show in green
                                fs.unlink(fileBanner);
                            } else {
                                //Show in red
                            }
                        });
                        /////// Success
                        callback(
                            {
                                adbutlerRes: true,
                                campaignID: bannerCampaign.id,
                                creativeImageID: creativeImage.id,
                                bannerID: response.advertisement.id
                            }
                        );
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

    if (adbutlerJson.fileBanner) {
        path = './uploads/' + adbutlerJson.fileBanner;
        callback({
            saveImage: true,
            fileBanner: path
        });
    } else {
        fileName = adbutlerJson.idImage + ".png";
        path = './uploads/';
        path = path + fileName;
        // console.log("<<<<path>>>>");
        //console.log(path);
        http.request(adbutlerJson.linkImage, function (response) {
            // console.log(">>>request<<<");
            //console.log(response);
            var data = new Stream();

            response.on('data', function (chunk) {
                data.push(chunk);
            });

            response.on('end', function () {
                fs.writeFile(path, data.read(), function (err) {
                    if (err) {
                        //console.log(err);
                        callback({saveImage: false, error: err});
                    } else {
                        //console.log("success save");
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


var insertRecords = function (zohoJson, campaignID, creativeImageID, bannerID, placementsId, advertiserID, callback) {
    //console.log(">>>> insertRecords <<<<");
    //console.log(zohoJson);
    //console.log(campaignID);
    // console.log(creativeImageID);
    //console.log(bannerID);
    // console.log(advertiserID);

    var url_campanha = 'https://admin.adbutler.com/?ID=169124&p=campaign.banner.edit&advID=' + zohoJson.id_Adbutler +
        '&p=campaign.banner.edit&advID=74406&campaignID=' + campaignID +
        '&bannerID=' + bannerID;
    //console.log(url_campanha)

    var xml = "";
    var lifetime_dates = "No date restrictions ";
    if (moment(zohoJson.start_date, "YYYY-MM-DD").isValid()) {
        lifetime_dates = "Use date range";
    }
    ;
    //console.log(lifetime_dates);
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
        "<FL val='ID Banner'>" + bannerID + "</FL>" +
        "<FL val='ID Campanha'>" + campaignID + "</FL>" +
        "<FL val='CONTA CONEKTTA'>" + zohoJson.email + "</FL>" +
        "<FL val='Placement'>" + placementsId + "</FL>" +
        "<FL val='Imagem'>" + creativeImageID + "</FL>" +
        "</row>" +
        "</CustomModule2>"

    //console.log(xml);
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
        // console.log(body);
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
                //console.log(body);
                res.json({success: true, response: JSON.parse(response.body)});
            }

        } catch (err) {
            res.json({success: false});
            return;
        }

    })

});

router.post('/campaignsListStats', function (req, res, next) {
    var token = "?api_token=" + global.token;
    var id_user = req.body.id_user;
    var advertiserId = req.body.advertiserId;
    var preset = req.body.preset;
    var pathname = 'consultas/ads/';
    var url = config.word_url + pathname + id_user + token;

    request({
        uri: url,
        method: "GET"
    }, function (error, response, body) {
        if (error) {
            res.json({success: false});
            return;
        }
        try {
            if (body === '"Sem registros para esse usuario"') {
                res.json({success: false, response: body});
            } else {
                var campaigns = JSON.parse(body);
                adbutler.stats.read({
                    'type': 'campaign',
                    'period' :'day',
                    'timezone' :'America/Los_Angeles',
                    'preset':  preset,
                    advertisers : advertiserId

                }).then(function (stats) {
                    for (var indexStats in stats.data) {
                        //console.log("<<<<<<<<<<<");
                        //console.log(indexStats);
                        //console.log(indexStats);
                        for (var indexCampaigns in campaigns) {
                            //console.log(campaigns[indexCampaigns].id_campanha);
                            if(campaigns[indexCampaigns].id_campanha == indexStats){
                                campaigns[indexCampaigns].impressions = stats.data[indexStats][0].impressions;
                                campaigns[indexCampaigns].clicks = stats.data[indexStats][0].clicks
                            }
                        }

                    }

                    for (var index in campaigns) {
                        if(!campaigns[index].impressions){
                            campaigns[index].impressions = 0;
                        }
                        if(!campaigns[index].clicks){
                            campaigns[index].clicks = 0;
                        }
                    }

                    //console.log(campaigns);
                    res.json({success: true, response: campaigns});

                }).catch(function (statsError) {
                    console.log(statsError);
                    res.json({success: false, response: statsError});
                });



            }


        } catch (err) {
            res.json({success: false});
            return;
        }

    })



});

router.post('/stats', function (req, res, next) {

    var settings = req.body;
    var stattsData = [];
    var statData = {};
    //console.log(settings.campaigns);

    adbutler.stats.read(settings)
        .then(function (stats) {
            for(var index in stats.data[settings.campaigns] ){
                statData = {
                    data:moment(stats.data[settings.campaigns][index].start_date).format('DD/MM/YYYY'),
                    impressions:stats.data[settings.campaigns][index].impressions,
                    clicks:stats.data[settings.campaigns][index].clicks
                }
                stattsData.push(statData);
            }
           // console.log(stattsData);

            res.json({success: true, response: stats,stattsData:stattsData});
        })
        .catch(function (statsError) {
            //console.log(statsError);
            res.json({success: false, response: statsError});
        });


});

router.post('/statsAdvertiser', function (req, res, next) {

    var advertiserId = req.body.advertiserId;
    var preset = req.body.preset;
    var stattsData = [];
    var statData = {};
    var jsonReturn = {};

    adbutler.stats.read({
        'type': 'advertiser',
        'period': 'day',
        'timezone': 'America/Los_Angeles',
        'preset': preset,
        advertisers : advertiserId
    }).then(function (stats) {
        var json = stats;
        for (var prop in json.data) {
            //console.log(json.data[prop]);
                for (var stats in json.data[prop]) {
                    statData = {
                        data:moment(json.data[prop][stats].start_date).format('DD/MM/YYYY'),
                        impressions:json.data[prop][stats].impressions,
                        clicks:json.data[prop][stats].clicks
                    }
                    stattsData.push(statData);
                }


        }
       // console.log(stattsData);
        res.json({success: true, response: stattsData});
    }).catch(function (statsError) {
        console.log(statsError);
        res.json({success: false, response: statsError});
    });
});

router.post('/statsCampaign', function (req, res, next) {

    //console.log(req.body);
    res.json({success: false});
});

router.post('/createAds', function (req, res, next) {
    var data = req.body;
    //console.log(data);

    saveImage(data.adbutler, function (saveImageRes) {
        //console.log("-*-*-*-*-*-*-*");
        //console.log(saveImageRes);
        if (saveImageRes.saveImage) {
            //console.log(saveImageRes);
            imageBannerVs2(data.adbutler, saveImageRes.fileBanner, function (imageBannerRes) {
                // console.log(">>>>> imageBannerRes <<<<<");
                // console.log(imageBannerRes);
                if (imageBannerRes.adbutlerRes) {
                    createSchedules(data.schedules, function (schedulesRes) {
                        // console.log(">>>>> schedulesRes <<<<<");
                        if (schedulesRes.schedulesRes) {
                            placements(data.placements, schedulesRes.schedules.id, imageBannerRes.campaignID, function (placementsRes) {
                                if (placementsRes.placementsRes) {
                                   // console.log(">>>placementsRes<<<");
                                   // console.log(placementsRes.placements);
                                    insertRecords(data.zoho,
                                        imageBannerRes.campaignID,
                                        imageBannerRes.creativeImageID,
                                        imageBannerRes.bannerID,
                                        placementsRes.placements,
                                        data.adbutler.advertiserID, function (insertRecordsRes) {
                                        if (insertRecordsRes.insertRecordsRes) {
                                            res.json({
                                                success: true
                                            });

                                        } else {
                                            res.json({
                                                success: false,
                                                mensage: "Erro ao publicar campanha",
                                                error: insertRecordsRes.error
                                            });
                                        }
                                    })
                                } else {
                                    res.json({
                                        success: false,
                                        mensage: "Erro ao publicar campanha",
                                        error: placementsRes.error
                                    });
                                }

                            });
                            //data.placements
                        } else {
                            res.json({
                                success: false,
                                mensage: "Erro ao publicar campanha",
                                error: schedulesRes.schedulesError
                            });
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        mensage: "Erro ao publicar campanha",
                        error: imageBannerRes.error
                    });
                }
            });
        } else {
            res.json({
                success: false,
                mensage: "Erro ao publicar campanha",
                error: saveImageRes.error
            });
        }
    });


    /*saveImage(data.adbutler, function (saveImageRes) {
     console.log(saveImageRes);
     })*/
    ;

    /*insertRecords(data.zoho, function (insertRecordsRes) {
     console.log(insertRecordsRes);
     });*/

});


module.exports = router;