var express = require('express');
var router = express.Router();
var path = require('path');
var multer = require('multer');
var upload = multer({dest:'uploads/'});
var appPath = path.dirname(__dirname);
var uploadToS3 = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).uploadToS3;
var CSV = require('csv-string');
var fs = require('fs');

router.post('/import',upload.single('importFile'),function(req,res,next){
    if (req.file !== undefined) {

        var filepath = req.file.path;
        var filename = req.file.originalname;
        var foldername = filename.slice(0, -4);
        var category = req.body.selectedItem;

       var config = {
           "imported": true,
           "keywords": req.body.keywords.split(',')
       };

       var configPath = "uploads/config.json";

       fs.writeFile(configPath, JSON.stringify(config), function (err) {
           if (err) res.send({ERROR: err});
           else {
               var promise_arr = [];
               promise_arr.push(uploadToS3(filepath, s3FolderName + '/GraphQL/'
                   + category + '/' + foldername + '/' + filename));
               promise_arr.push(uploadToS3(configPath, s3FolderName + '/GraphQL/'
                   + category + '/' + foldername + '/config.json'));
               Promise.all(promise_arr).then(urls => {
                   fs.unlinkSync(filepath);
                   fs.unlinkSync(configPath);
                   res.status(200).send({urls: urls});
               }).catch(err => {
                   fs.unlinkSync(filepath);
                   fs.unlinkSync(configPath);
                   console.log(err);
                   res.send({ERROR: err});
               });
           }
       });
    }
    else{
        res.send({ERROR:'No file has been selected!'});
    }

});

module.exports = router;
