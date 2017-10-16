var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(__dirname);
var syncFolder = require(path.join(appPath,'scripts','gdrive.app.js'));

router.post('/export',function(req,res,next){
	
	if (req.body.id == 'googleDrive-export'){
		if (req.session.google_access_token !== undefined){
			syncFolder('./downloads', 'SMILE',req.session.google_access_token);			
		}else{
			console.log('Goolge Drive token has expired!!');
		}
	}
	  
});


module.exports = router;