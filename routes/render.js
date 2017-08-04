require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var CSV = require('csv-string');
//TODO fs.unlink has some issues needed to be fixed
//var rootDIR = path.resolve('.');
var admZip = require('adm-zip');

router.post('/render',function(req,res,next){

	if (req.body.filename !== 'Please Select...'){
		
		if (req.body.filename.substr(-4) === '.csv' || req.body.filename.substr(-4) === '.txt' || req.body.filename.substr(-4) === '.dat'){
			
			var preview_string = fs.readFileSync(process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL + '/' + req.body.filename, "utf8");
			var preview_arr = CSV.parse(preview_string);
			res.send({preview:preview_arr.slice(0,50)}); // preview the top 50 line?
			
		}else if (req.body.filename.substr(-4) === '.zip'){
			
			var zip = new admZip(process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL + '/' + req.body.filename);
			var zipEntries = zip.getEntries();
			
			// piece the Entries inforamtion into a nice table
			var zipInfo = [['filename','compressed size','is encripted?','file size', 'created time','version']];
			for (var i=0, length=zipEntries.length; i<length;i++){
				zipInfo.push([
					zipEntries[i]['entryName'],
					zipEntries[i]['header']['compressedSize'],
					zipEntries[i]['header']['encripted'],
					zipEntries[i]['header']['size'],
					zipEntries[i]['header']['time'],
					zipEntries[i]['header']['version']
				])
			}
			res.send(zipInfo);
		}
		
	}else{
		res.send();
	}
});

module.exports = router;