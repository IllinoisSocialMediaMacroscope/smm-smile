var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var submit_Batchjob = require(path.join(appPath,'scripts','helper_func','batchHelper.js'));
var uuidv4 = require(path.join(appPath,'scripts','helper_func','uuidv4.js'));

router.get('/NLP-autophrase',function(req,res,next){
    var formParam = require('./autophrase.json');
    res.render('analytics/formTemplate',{parent:'/#Auto-phrase', title:'Automated Phrase Mining', param:formParam});
});

router.post('/NLP-autophrase',function(req,res,next){

    var uid = uuidv4();

    if (req.body.selectFile !== 'Please Select'){

            var jobName = s3FolderName + '_Autophrase_sdk';
            var command = [
                "./auto_phrase.sh",
                req.body.prefix,
                req.body.selectFileColumn,
                req.body.minSup,
                s3FolderName + '/NLP/autophrase/' + uid +'/',
                req.body.email,
                req.body.sessionURL
            ];

            submit_Batchjob(
                "arn:aws:batch:us-west-2:083781070261:job-definition/smile_autophrase:1",
                jobName,
                "arn:aws:batch:us-west-2:083781070261:job-queue/SMILE_autophrase",
                command
            ).then(results =>{
                results['uid'] = uid;
                res.send(results);
            }).catch(err =>{
                res.send({ERROR:err});
            });

    }else{
        res.end('no file selected!');
    }

});

module.exports = router;
