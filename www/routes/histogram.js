var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(__dirname);
var lambda_invoke = require(path.join(appPath,'scripts','helper_func','lambdaHelper.js'));
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));

router.post('/histogram',function(req,res,next){
	console.log(req.body);
	var args = {'s3FolderName':req.body.s3FolderName, 
				'filename':req.body.filename,
				'remoteReadPath':req.body.remoteReadPath,
				'interval': req.body.interval
			}
			
	lambda_invoke('histogram', args).then(results =>{
		// download div file
		getMultiRemote(results['url'])
		.then(function(data){
			var histogram = data;
			// rendering
			res.send({histogram:histogram});
		}).catch(err =>{ // download div error
			console.log(err);
			res.send({ERROR:err});
		});
				
	}).catch( error =>{ // lambda histogram error
		console.log(error);
		res.send({'ERROR':JSON.stringify(error)});
	});
});

module.exports = router;