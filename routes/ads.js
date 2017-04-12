var express = require('express');
var router = express.Router();
var request = require("request");
var AdButler = require("adbutler");
var async = require('async');
var js2xmlparser = require("js2xmlparser");
var xml2js = require('xml2js');
var adbutler = new AdButler({
    'apiKey': 'ebe604963bdb8e8a5ddfa4794dac2563'
});
var zohoToken = "a41d3828cae33450cdd258a46f0e85f6";
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, '../uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var fs = require('fs');
var upload = multer({storage: storage}).single('userPhoto');

router.post('/publishImage', function (req, res, next) {
    console.log(">>>publish");
    var mediaGroupID = 12409;  // NOTE: use the media group ID that exists in your account
    var file = req.body.adbutler.file;
    console.log(file);
    var obj = req.body.zoho;
    adbutler.creatives.images.create({
        "group": mediaGroupID,
        "name": req.body.adbutler.name,
        "description": req.body.adbutler.description.toString(),
        "file": file
    }).then(function (creativeImage) {
        // Creating a rich media banner
        adbutler.banners.images.create({
            "name": req.body.adbutler.name,
            "width": 300,
            "height": 250,
            "creative": creativeImage.id
        }).then(function (bannerImages) {
            // Creating a banner campaign
            console.log(bannerImages);
            adbutler.campaigns.banners.create({
                "advertiser": req.body.adbutler.advertiserID,
                "height": 250,
                "name": req.body.adbutler.name,
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
                    fs.exists(file, function (exists) {
                        if (exists) {
                            //Show in green
                            fs.unlink(file);
                        } else {
                            //Show in red
                        }
                    });
                    ///// InsertRecords

                    if (obj.zonas) {
                        xml = "<CustomModule2>" +
                            "<row no='1'>" +
                            "<FL val='Usuario Conektta'>" + obj.usuario + "</FL>" +
                            "<FL val='Nome'>" + obj.nome + "</FL>" +
                            "<FL val='ID Adbutler'>" + obj.id_Adbutler + "</FL>" +
                            "<FL val='Views'>" + obj.views + "</FL>" +
                            "<FL val='Canal'>" + obj.canal + "</FL>" +
                            "<FL val='Zonas'>" + obj.zonas + "</FL>" +
                            "</row>" +
                            "</CustomModule2>"
                    } else {
                        xml = "<CustomModule2>" +
                            "<row no='1'>" +
                            "<FL val='Usuario Conektta'>" + obj.usuario + "</FL>" +
                            "<FL val='Nome'>" + obj.nome + "</FL>" +
                            "<FL val='ID Adbutler'>" + obj.id_Adbutler + "</FL>" +
                            "<FL val='Views'>" + obj.views + "</FL>" +
                            "<FL val='Canal'>" + obj.canal + "</FL>"+
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
                            res.json({success: false, reponse: error}) ;
                        }

                        res.json({success: true, reponse: body}) ;

                    });
                });
            }).catch(function (bannerCampaignError) {

                res.json({success: false, reponse: bannerCampaignError});

            });
        }).catch(function (bannerImagesError) {

            res.json({success: false, reponse: bannerImagesError});
        });
    }).catch(function (creativeImageError) {

        res.json({success: false, reponse: creativeImageError});
    });
});

///////////////////?

router.post('/publishHtml5', function (req, res, next) {
    var mediaGroupID = 12409;  // NOTE: use the media group ID that exists in your account
    var advertiserID = 67886;  // NOTE: use the advertiser group ID that exists in your account
    var file = req.body.adbutler.file; // NOTE: a relative or absolute path to an existing zip archive
    var name = req.body.adbutler.name;
    var description = "testeteteteet";
    var obj = req.body.zoho;

    // Creating a rich media creative
    adbutler.creatives.richMedia.create({
        "group": mediaGroupID,
        "name": name,
        "description": description,
        "file": file
    }).then(function (creativeRichMedia) {
        // Creating a rich media bannerr
        adbutler.banners.richMedia.create({
            "name": name,
            "width": 300,
            "height": 250,
            "creative": creativeRichMedia.id
        }).then(function (bannerRichMedia) {
            // Creating a banner campaign
            adbutler.campaigns.banners.create({
                "advertiser": advertiserID,
                "height": 250,
                "name": name,
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

                    fs.exists(file, function (exists) {
                        if (exists) {
                            //Show in green
                            console.log('File exists. Deleting now ...');
                            fs.unlink(file);
                        } else {
                            //Show in red
                            console.log('File not found, so not deleting.');
                        }
                    });

                    ///// InsertRecords
                    console.log(">>>>>>>insertRecords - RESPONSE<<<<<<<<");
                    console.log(obj);
                    if (obj.zonas) {
                        xml = "<CustomModule2>" +
                            "<row no='1'>" +
                            "<FL val='Usuario Conektta'>" + obj.usuario + "</FL>" +
                            "<FL val='Nome'>" + obj.nome + "</FL>" +
                            "<FL val='ID Adbutler'>" + obj.id_Adbutler + "</FL>" +
                            "<FL val='Views'>" + obj.views + "</FL>" +
                            "<FL val='Canal'>" + obj.canal + "</FL>" +
                            "<FL val='Zonas'>" + obj.zonas + "</FL>" +
                            "</row>" +
                            "</CustomModule2>"
                    } else {
                        xml = "<CustomModule2>" +
                            "<row no='1'>" +
                            "<FL val='Usuario Conektta'>" + obj.usuario + "</FL>" +
                            "<FL val='Nome'>" + obj.nome + "</FL>" +
                            "<FL val='ID Adbutler'>" + obj.id_Adbutler + "</FL>" +
                            "<FL val='Views'>" + obj.views + "</FL>" +
                            "<FL val='Canal'>" + obj.canal + "</FL>"+
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
                            res.json({success: false, reponse: error}) ;
                        }
                        console.log(">>>>>>>insertRecords - RESPONSE<<<<<<<<");
                        console.log(body);
                        res.json({success: true, reponse: body}) ;

                    });

                });
            }).catch(function (bannerCampaignError) {
                res.json({success: false, reponse: bannerCampaignError});

            });
        }).catch(function (bannerRichMediaError) {
            res.json({success: false, reponse: bannerRichMediaError});
        });
    }).catch(function (creativeRichMediaError) {
        res.json({success: false, reponse: creativeRichMediaError});
    });
});

////////////////



router.get('/searchRecords', function (req, res, next) {
    var user = req.query.user;
    var url =  'https://crm.zoho.com/crm/private/json/CustomModule2/searchRecords?authtoken=' + zohoToken + '&scope=crmapi&criteria=(Usuario Conektta:' + user + ')&selectColumns=Leads(Nome,Situacao,Created Time,Views,ID Adbutler)';
    console.log(url);
    request({
        uri: url,
        method: "GET"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            res.json(error);
        }
        //console.log(JSON.parse(response.body));
        var jsonres = JSON.parse(response.body);
        var jsonContent = [];
        async.forEach(jsonres.response.result.CustomModule2.row, function (item) {

            async.forEach(item.FL, function (item2,key) {
                jsonContent.push(item2);
            });

        });

        try {
            res.json(jsonContent);
        }catch (err){
            res.json(err);
        }

    })

});

router.post('/zoho', function (req, res, next) {
    //console.log(req.body);
    var obj = req.body;
    var xml = "";
    console.log(obj);
    if (obj.zonas) {
        xml = "<CustomModule2>" +
            "<row no='1'>" +
            "<FL val='Usuario Conektta'>" + obj.usuario + "</FL>" +
            "<FL val='Nome'>" + obj.nome + "</FL>" +
            "<FL val='ID Adbutler'>" + obj.id_Adbutler + "</FL>" +
            "<FL val='Views'>" + obj.views + "</FL>" +
            "<FL val='Canal'>" + obj.canal + "</FL>" +
            "<FL val='Zonas'>" + obj.zonas + "</FL>" +
            "</row>" +
            "</CustomModule2>"
    } else {
        xml = "<CustomModule2>" +
            "<row no='1'>" +
            "<FL val='Usuario Conektta'>" + obj.usuario + "</FL>" +
            "<FL val='Nome'>" + obj.nome + "</FL>" +
            "<FL val='ID Adbutler'>" + obj.id_Adbutler + "</FL>" +
            "<FL val='Views'>" + obj.views + "</FL>" +
            "<FL val='Canal'>" + obj.canal + "</FL>"+
            "</row>" +
            "</CustomModule2>"
    }
    console.log(xml);
    var url = "https://crm.zoho.com/crm/private/json/CustomModule2/insertRecords?authtoken=" + zohoToken +
        "&scope=crmapi&newFormat=1&xmlData=" + xml;
    console.log(url);
    request({
        uri: url,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }

    }, function (error, response, body) {

        if (error) {
            res.send(error);
        }
        console.log(body);
        res.json({success: true, reponse: body});

    })


});

router.post('/createBannerImage', function (req, res, next) {
    var mediaGroupID = 12409;  // NOTE: use the media group ID that exists in your account
    var advertiserID = 67886;  // NOTE: use the advertiser group ID that exists in your account
    var file = req.body.file; // NOTE: a relative or absolute path to an existing zip archive
    var name = req.body.title;
    var description = "Teste";

    console.log(file);

    // Creating a rich media creative
    adbutler.creatives.images.create({
        "group": mediaGroupID,
        "name": name,
        "description": description,
        "file": file
    }).then(function (creativeImage) {
        // Creating a rich media banner
        adbutler.banners.images.create({
            "name": name,
            "width": 300,
            "height": 250,
            "creative": creativeImage.id
        }).then(function (bannerImages) {
            // Creating a banner campaign
            adbutler.campaigns.banners.create({
                "advertiser": advertiserID,
                "height": 250,
                "name": name,
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

                    fs.exists(file, function (exists) {
                        if (exists) {
                            //Show in green
                            console.log('File exists. Deleting now ...');
                            fs.unlink(file);
                        } else {
                            //Show in red
                            console.log('File not found, so not deleting.');
                        }
                    });

                    res.json({success: true, reponse: response});
                });
            }).catch(function (bannerCampaignError) {
                res.json({success: false, reponse: bannerCampaignError});

            });
        }).catch(function (bannerImagesError) {
            res.json({success: false, reponse: bannerImagesError});
        });
    }).catch(function (creativeImageError) {
        res.json({success: false, reponse: creativeImageError});
    });
});


router.post('/createBannerHtml5', function (req, res, next) {

    var adbutler = new AdButler({
        apiKey: 'ebe604963bdb8e8a5ddfa4794dac2563'
    })

    var mediaGroupID = 12409;  // NOTE: use the media group ID that exists in your account
    var advertiserID = 67886;  // NOTE: use the advertiser group ID that exists in your account
    var file = "banner.zip"; // NOTE: a relative or absolute path to an existing zip archive

// Creating a rich media creative
    adbutler.creatives.richMedia.create({
        "group": mediaGroupID,
        "name": "Html banner ricardo",
        "description": "Html banner ricardo",
        "file": file
    }).then(function(creativeRichMedia) {
        // Creating a rich media banner
        adbutler.banners.richMedia.create({
            "name": "Html banner ricardo",
            "width": 300,
            "height": 250,
            "creative": creativeRichMedia.id
        }).then(function(bannerRichMedia) {
            // Creating a banner campaign
            adbutler.campaigns.banners.create({
                "advertiser": advertiserID,
                "height": 250,
                "name": "Html banner ricardo",
                "width": 300
            }).then(function (bannerCampaign) {
                // Assigning banner to the campaign
                adbutler.campaignAssignments.create({
                    "campaign": bannerCampaign.id,
                    "advertisement": {
                        id: bannerRichMedia.id,
                        type: "banner"
                    }
                }, function(error, response) {
                    console.log(response);
                });
            }).catch(function (bannerCampaignError) {
                console.log(bannerCampaignError);
            });
        }).catch(function(bannerRichMediaError) {
            console.log(bannerRichMediaError);
        });
    }).catch(function(creativeRichMediaError) {
        console.log(creativeRichMediaError);
    });


    res.json({success: true});
});

module.exports = router;