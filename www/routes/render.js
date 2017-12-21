//require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var CSV = require('csv-string');
var path = require('path');
var appPath = path.dirname(__dirname);
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));
var list_files = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_files;


router.post('/render',function(req,res,next){

	if (req.body.prefix !== '' && req.body.prefix !== undefined){
		
		var p = list_files(req.body.prefix);
		p.then((folderObj) =>{
			// folderObj[filename] = fileURL;
			var fileList = Object.keys(folderObj);
			for (var i=0, length=fileList.length; i< length; i++){
				if (fileList[i].slice(-4) === '.csv'){
					var fileURL = folderObj[fileList[i]];
					
					var p2 = getMultiRemote(fileURL);
					p2.then((preview_string) => {
						if (preview_string === ''){
						res.send({ERROR: 'This dataset you selected is empty, please select another one!'});
						}else{
							var preview_arr = CSV.parse(preview_string);
							res.send({preview:preview_arr}); 
						}
					});
					
				}
			}
			
		}).catch( (err) => {
			res.send({ERROR:err});
		});
	}else{
		res.send();
	}
});

module.exports = router;