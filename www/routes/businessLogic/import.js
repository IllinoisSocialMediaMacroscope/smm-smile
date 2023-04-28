var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var CSV = require('csv-string');
var appPath = path.dirname(path.dirname(__dirname));

// if smile home folder doesn't exist, create one
if (!fs.existsSync(smileHomePath)) {
    fs.mkdirSync(smileHomePath);
}
var multer = require('multer');
var uploadPath = path.join(smileHomePath, 'uploads');
var upload = multer({dest:uploadPath});

router.post('/import', checkIfLoggedIn, upload.single('importFile'),function(req,res,next){
    if (req.file !== undefined) {
        var filepath = req.file.path;
        var filename = req.file.originalname;
        var foldername = filename.slice(0, -4);
        var category = req.body.selectedItem;
        var keywords = req.body.keywords.split(',');

        var config = {
            "imported": true,
            "keywords": keywords
        };

        // TODO check empty string: this might be slow
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
            if (!fs.existsSync(path.join(uploadPath, req.user.email))){
                fs.mkdirSync(path.join(uploadPath, req.user.email));
            }

            var configPath = path.join(uploadPath, req.user.email, "config.json");
            fs.writeFile(configPath, JSON.stringify(config), function (err) {
                if (err) res.send({ERROR: err});
                else {

                    var folderFullPath = req.user.email + '/GraphQL/' + category + '/' + foldername + '/';
                    var fileFullPath = folderFullPath + filename;
                    var configFullPath = folderFullPath + '/config.json';

                    // tagging it with keywords
                    var tagIdMapPath = path.join(smileHomePath, req.user.email, 'map.json');
                    if (fs.existsSync(tagIdMapPath)){
                        var tagIdMap = JSON.parse(fs.readFileSync(tagIdMapPath));
                        tagIdMap[folderFullPath] = keywords;
                    }else{
                        tagIdMap = {};
                        tagIdMap[folderFullPath] = keywords;
                    }
                    fs.writeFileSync(tagIdMapPath,JSON.stringify(tagIdMap, null, 2));

                    var promise_arr = [];
                    promise_arr.push(s3.uploadToS3(filepath, fileFullPath));
                    promise_arr.push(s3.uploadToS3(configPath, configFullPath));
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
