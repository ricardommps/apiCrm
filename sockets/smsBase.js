var request = require("request");
var striptags = require('striptags');
var aws = require("aws-sdk");

var SMSAPI = require('smsapicom'),
    smsapi = new SMSAPI();
smsapi.authentication
    .login('conektta', 'b7d76ae495b90e0b5f7f6f7b7199a389');
aws.config.loadFromPath(__dirname + '/../config-aws-ses.json');
var ses = new aws.SES();
module.exports = function (io) {
    'use strict';
    io.on('connection', function (socket) {


    });


};
