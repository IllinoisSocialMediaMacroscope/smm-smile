var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

router.get('/tag', function(req,res,next){
    // TODO cross compare with the current file list &
    // TODO when search, only show tags that current has a valid file path
    var tagIdMapPath = path.join(smileHomePath, 'map.json');
    var searchTag = req.query.tagName || "";
    var matchedTag = {};

    if (fs.existsSync(tagIdMapPath)){
        var tagIdMap = JSON.parse(fs.readFileSync(tagIdMapPath));
        for (var ID in tagIdMap){
            for (var i=0; i < tagIdMap[ID].length; i++){
                if (tagIdMap[ID][i].toLowerCase().indexOf(searchTag.toLowerCase()) >= 0){
                    matchedTag[ID] = tagIdMap[ID];
                }
            }
        }
    }
    res.send(matchedTag);
});

router.post('/tag',function(req,res,next){
    if (req.body.tagName !== undefined && req.body.tagName.length > 0){

        // if smile home folder doesn't exist, create one
        if (!fs.existsSync(smileHomePath)){
            fs.mkdirSync(smileHomePath);
        }

        var tagIdMapPath = path.join(smileHomePath, 'map.json');

        if (fs.existsSync(tagIdMapPath)){
            var tagIdMap = JSON.parse(fs.readFileSync(tagIdMapPath));
            tagIdMap[req.body.jobId] = req.body.tagName;
        }else{
            tagIdMap = {};
            tagIdMap[req.body.jobId] = req.body.tagName;
        }

        // save it to file
        fs.writeFileSync(tagIdMapPath,JSON.stringify(tagIdMap, null, 2));
    }

    res.send({tagName: req.body.tagName});

});

router.delete('/tag', function(req, res, next){
    if(req.body.jobId !== undefined && req.body.jobId !== ""){

        var tagIdMapPath = path.join(smileHomePath, 'map.json');
        if (fs.existsSync(tagIdMapPath)){
            var tagIdMap = JSON.parse(fs.readFileSync(tagIdMapPath));
            delete tagIdMap[req.body.jobId];
            fs.writeFileSync(tagIdMapPath,JSON.stringify(tagIdMap, null, 2));
        }
    }

    res.send({jobId: req.body.jobId});
});

module.exports = router;

