var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var fs = require('fs');
var {deleteTags, createTags} = require(path.join(appPath, 'scripts', 'helper_func', 'helper.js'));


router.get('/tag', checkIfLoggedIn, function(req,res,next){
    // TODO cross compare with the current file list &
    // TODO when search, only show tags that current has a valid file path
    var tagIdMapPath = path.join(smileHomePath, req.user.email, 'map.json');
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

router.post('/tag', checkIfLoggedIn, function(req,res,next){
    if (req.body.tagName !== undefined && req.body.tagName.length > 0){

        // if smile home folder doesn't exist, create one
        if (!fs.existsSync(smileHomePath)){
            fs.mkdirSync(smileHomePath);
        }

        // if that user path doesn't exist
        if (!fs.existsSync(path.join(smileHomePath, req.user.email))){
            fs.mkdirSync(path.join(smileHomePath, req.user.email));
        }

        var tagIdMapPath = path.join(smileHomePath, req.user.email, 'map.json');

        createTags(tagIdMapPath, req.body.jobId, req.body.tagName);
    }

    res.send({tagName: req.body.tagName});

});

router.delete('/tag', checkIfLoggedIn, function(req, res, next){
    if(req.body.jobId !== undefined && req.body.jobId !== ""){
        var tagIdMapPath = path.join(smileHomePath, req.user.email, 'map.json');
        deleteTags(tagIdMapPath, req.body.jobId);
    }

    res.send({jobId: req.body.jobId});
});

module.exports = router;

