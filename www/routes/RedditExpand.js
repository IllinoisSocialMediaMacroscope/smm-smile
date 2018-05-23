var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(__dirname);
var submit_Batchjob = require(path.join(appPath,'scripts','helper_func','batchHelper.js'));
var list_files = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_files;

router.post('/reddit-expand',function(req,res,next){
	list_files(req.body.prefix).then((data) =>{
		
		// check if comment.zip already exist or not
		var exist = false;
		for (filename in data){
			if (filename.slice(-4) === '.zip'){
				exist = true;
			}
		}
		
		// check if user still wants to collect it; overwrite the exist 
		if(exist == false || (exist == true && req.body.consent == 'true')){
			var jobName = req.body.s3FolderName + '_RedditComment_sdk';
			var command = [ "python3.6", "/scripts/RedditComment.py",
					"--remoteReadPath", req.body.prefix,
					"--s3FolderName", req.body.s3FolderName,
					"--email", req.body.email,
                	"--sessionURL", req.body.sessionURL]
					
			submit_Batchjob(jobName,command).then(results =>{
				res.end('done');
			}).catch(err =>{
				res.send({ERROR:err});
			});	
		}else if(exist == true && req.body.consent == undefined){
			res.send('pop alert');
		}else{
			res.end('no information');
		}
		
	}).catch(err =>{
		console.log(err);
	})	
	
});



module.exports = router;
