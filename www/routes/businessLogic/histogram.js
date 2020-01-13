var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));

router.post('/histogram',function(req,res,next){
	
	var args = {
				's3FolderName': s3FolderName,
				'filename':req.body.filename,
				'remoteReadPath':s3FolderName + req.body.remoteReadPath,
				'interval': req.body.interval };
			
	lambdaHandler.invoke('histogram', args).then(results =>{
		// download div file
		if (results['url'] == 'null'){
			res.send({'ERROR': 'this dataset does not contain timestamps! Hence, we cannot rendering a recap for you.'});
		}else{
			getMultiRemote(results['url'])
			.then(function(data){
				var histogram = data;
				res.send({histogram:histogram});
			}).catch(err =>{ // download div error
				console.log(err);
				res.send({ERROR:err});
			});
		}		
	}).catch( error =>{ // lambda histogram error
		console.log(error);
		res.send({'ERROR':error});
	});
});

module.exports = router;
