var express = require('express');
var router = express.Router();
var request = require("request");
var AdButler = require("adbutler");
var async = require('async');
var adbutler = new AdButler({
    'apiKey': 'ebe604963bdb8e8a5ddfa4794dac2563'
});

router.get('/campaignsList', function (req, res, next) {

    adbutler.campaigns.banners.list({
        limit: 100
    })
        .then(function(banners) {
            console.log(banners);
            res.json({ success: true, banners: banners });
        }).catch(function(bannersError) {
            console.log(bannersError);
        res.json({ success: false, banners: bannersError });
    });

});





module.exports = router;