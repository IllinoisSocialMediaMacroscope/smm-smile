var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(__dirname);
var submit_Batchjob = require(path.join(appPath,'scripts','helper_func','batchHelper.js'));

router.post('/reddit-expand',function(req,res,next){
	var jobName = req.body.s3FolderName + '_RedditComment_sdk';
	var command = [ "python3.6", "/scripts/RedditComment.py",
			"--remoteReadPath", req.body.prefix,
			"--s3FolderName", req.body.s3FolderName,
			"--email", req.body.email]
			
	submit_Batchjob(jobName,command).then(results =>{
		console.log(results);
		res.end('done');
	}).catch(err =>{
		res.send({ERROR:err});
	});			
});


module.exports = router;