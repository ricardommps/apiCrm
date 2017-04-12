var express = require('express');
var request = require("request");
var async = require('async');
var unique = require('array-unique');
var router = express.Router();
var multer  =   require('multer');
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads/');
    },
    filename: function (req, file, callback) {
        console.log(file.originalname);
        callback(null, file.originalname);
    }
});
var upload = multer({ storage : storage}).single('file');

/* GET users listing. */
router.post('/upload', function(req, res, next) {

    upload(req,res,function(err) {
        if(err) {
            res.json({error_code:1,err_desc:err});
            return;
        }
        res.json({error_code:0,err_desc:null})
    });


});

module.exports = router;

