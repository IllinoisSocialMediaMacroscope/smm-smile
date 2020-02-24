var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var CSV = require('csv-string');
var appPath = path.dirname(path.dirname(__dirname));
var isLoggedIn = require(path.join(appPath, 'scripts', 'helper_func', 'loginMiddleware.js'));

// if smile home folder doesn't exist, create one
if (!fs.existsSync(smileHomePath)) {
    fs.mkdirSync(smileHomePath);
}
var multer = require('multer');
var uploadPath = path.join(smileHomePath, 'uploads');
var upload = multer({dest:uploadPath});

router.post('/import', isLoggedIn, upload.single('importFile'),function(req,res,next){
    if (req.file !== undefined) {
        var filepath = req.file.path;
        var filename = req.file.originalname;
        var foldername = filename.slice(0, -4);
        var category = req.body.selectedItem;

        var config = {
            "imported": true,
            "keywords": req.body.keywords.split(',')
        };

        var importString = fs.readFileSync(filepath).toString();
        var importArr = CSV.parse(importString);
        for (var i = 0; i < importArr.length; i++) {
            var allEmptyFlag = true;
            for (var j = 0; j < importArr[i].length; j++){
                if (importArr[i][j] !== ""){
                    allEmptyFlag = false;
                    continue;
                }
            }
            if (allEmptyFlag){
                break;
            }
        }
        if (allEmptyFlag){
            res.send({ERROR: 'Your uploaded CSV is not valid, please make sure there is no empty line in your CSV file.'});
        }
        else{
            // if that user path doesn't exist
            if (!fs.existSync(path.join(uploadPath, req.user.username))){
                fs.mkdirSync(path.join(uploadPath, req.user.username));
            }

            var configPath = path.join(uploadPath, req.user.username, "config.json");
            fs.writeFile(configPath, JSON.stringify(config), function (err) {
                if (err) res.send({ERROR: err});
                else {
                    var promise_arr = [];
                    promise_arr.push(s3.uploadToS3(filepath, req.user.username + '/GraphQL/'
                        + category + '/' + foldername + '/' + filename));
                    promise_arr.push(s3.uploadToS3(configPath, req.user.username + '/GraphQL/'
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
    }
    else{
        res.send({ERROR:'No file has been selected!'});
    }

});

module.exports = router;
