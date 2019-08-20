var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var submit_Batchjob = require(path.join(appPath,'scripts','helper_func','batchHelper.js')).submit_Batchjob;
var list_files = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_files;

router.post('/image-crawler',function(req,res,next){
    list_files(req.body.prefix).then((data) =>{

        // check if img already exist or not
        var exist = false;
        for (filename in data){
            if (filename === 'images.zip'){
                exist = true;
            }
        }

        // check if user still wants to collect it; overwrite the exist
        if(exist === false || (exist === true && req.body.consent === 'true')){
            var jobName = s3FolderName + '_imageCrawler_sdk';
                var command = [ "python3.6", "/scripts/batch_function.py",
                "--remoteReadPath", req.body.prefix,
                "--email", req.body.email,
                "--sessionURL", req.body.sessionURL];

            submit_Batchjob(
                "arn:aws:batch:us-west-2:083781070261:job-definition/smile_image_crawler:1",
                jobName,
                "arn:aws:batch:us-west-2:083781070261:job-queue/SMILE_batch",
                command
            ).then(results =>{
                res.end('done');
            }).catch(err =>{
                res.send({ERROR:err});
            });
        }
        else if(exist === true && req.body.consent === undefined){
            res.send('pop alert');
        }
        else{
            res.end('no information');
        }

    }).catch(err =>{
        console.log(err);
    })

});



module.exports = router;
