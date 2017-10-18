var express = require('express');
var router = express.Router();
var admzip = require('adm-zip');
var fs = require('fs');
var google = require('googleapis');
var fs = require('fs');
var OAuth2 = google.auth.OAuth2;


router.post('/export',function(req,res,next){
	
	
	if (req.body.id == 'googleDrive-export'){
		
		//console.log(req.session.google_access_token);
		
		if (req.session.google_access_token !== undefined){
			if (fs.existsSync('./downloads')){
				zipDownloads();
			
				var oauth2Client = new OAuth2('***REMOVED***',
								'***REMOVED***', 'http://localhost:8001/login/google/callback');
				oauth2Client.credentials = {'access_token':req.session.google_access_token}
				var drive = google.drive({version: 'v2', auth: oauth2Client });
				buffer = fs.readFileSync('./downloads/SMILE.zip');
				drive.files.insert(
				{ resource:
					{ 
						title: 'SMILE.zip',
						mimeType: 'application/octet-stream' 
					},
						media:
							{ body: buffer,
								mimeType: 'application/octet-stream' 
							},
						type: 'multipart' 
				}, function(err,response){
						if (err) {
							console.log(err);
							res.send({'ERROR':err});
						}else{
							res.send(response);
						}
					
				});
			}else{
				res.send({'ERROR':'You don\'t have any data associate with this session. Nothing to export!'});
			}
			
		}else{
			console.log('Goolge Drive token has expired!!');
			res.send({'ERROR':'Goolge Drive token has expired. Please authorize again!'});
		}
	}
	  
});

function zipDownloads(){
	// zip it first
	var zip = new admzip();
	if (fs.existsSync('./downloads/GraphQL')){
		zip.addLocalFolder('./downloads/GraphQL','/');
	}
	if (fs.existsSync('./downloads/NW')){
		zip.addLocalFolder('./downloads/NW','/');
	}
	if (fs.existsSync('./downloads/NLP')){
		zip.addLocalFolder('./downloads/NLP','/');
	}
	if (fs.existsSync('./downloads/NLP')){
		zip.addLocalFolder('./downloads/NLP','/');
	}
	zip.writeZip('./downloads/SMILE' + '.zip');
	
}

module.exports = router;