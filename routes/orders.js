var express = require('express');
var router = express.Router();
var request = require("request");
var async = require('async');
var config = require('../config.json');

var WooCommerceAPI = require('woocommerce-api');
var WooCommerce = new WooCommerceAPI({
    url: 'https://conektta.com.br',
    consumerKey: 'ck_009346debedbc753b12702a7d6b06428323493e5',
    consumerSecret: 'cs_1f50b9a035de4b9b0d3e41c45b81d5e1c0271023',
    wpAPI: true,
    version: 'wc/v1'
});

router.get('/myOrders', function (req, res, next) {
    var email = req.query.email;
    //console.log(req.query);
    WooCommerce.get('orders?search='+email, function(err, data, response) {
        try{
            var jsonResponse = JSON.parse(response);
            if(jsonResponse.length > 0){
                res.json({success:true,response:jsonResponse});
            }else{
                var msg = "Nenhum dado encontrado";
                res.json({success:false,response:msg});
            }
        }catch (err){
            res.json({success:false});
        }


    });
});

module.exports = router;

