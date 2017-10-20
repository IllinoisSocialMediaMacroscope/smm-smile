var express = require('express');
var router = express.Router();
var admzip = require('adm-zip');
var fs = require('fs');
var google = require('googleapis');
var fs = require('fs');
var OAuth2 = google.auth.OAuth2;
var Dropbox = require('dropbox');
var BoxSDK = require('box-node-sdk');

router.post('/export',function(req,res,next){
	
	if (fs.existsSync('./downloads')){
		var filename = zipDownloads();
		//get zip file size and decide which upload method to take
		var filesize = fs.statSync('downloads/' + filename).size;
		
		var buffer = fs.readFileSync('downloads/' + filename);
		
		if (req.body.id == 'googleDrive-export'){		
			if (req.session.google_access_token !== undefined){
							
				var oauth2Client = new OAuth2('***REMOVED***',
								'***REMOVED***', 'http://localhost:8001/login/google/callback');
				oauth2Client.credentials = {'access_token':req.session.google_access_token}
				var drive = google.drive({version: 'v2', auth: oauth2Client });
				drive.files.insert(
				{ resource:
					{ 
						title: filename,
						mimeType: 'application/octet-stream' 
					},
						media:
							{ body: buffer,
								mimeType: 'application/octet-stream' 
							},
						type: 'resumable' 
				}, function(err,response){
						if (err) {
							console.log(err);
							res.send({'ERROR':err});
						}else{
							fs.unlinkSync('./downloads/' + filename)
							res.send(response);
						}
					
				});			
			}else{
				console.log('Goolge Drive token has expired!!');
				res.send({'ERROR':'Goolge Drive token has expired. Please authorize again!'});
			}
			
		}else if (req.body.id == 'dropbox-export'){
			if (req.session.dropbox_access_token !== undefined){
					/*filesUpload(arg)
						create a new file with the contents provided in the request. 
						Do not use this to upload a file larger than 150 MB. Instead,
						create an upload session with upload_session/start.*/
					var dbx = new Dropbox({ accessToken: req.session.dropbox_access_token });

					if (filesize <= 140*1024*1024){
						dbx.filesUpload({contents:buffer,
											path:'/' + filename,
											mode:{'.tag':'overwrite'},
											autorename:true,
											mute:false})
							.then(function(response){
								fs.unlinkSync('./downloads/' + filename)
								//console.log(response);
								res.send(response);
							}).catch(function(err){
								//console.log(err);
								res.send({'ERROR':err})
							})
					}else{
						// TODO add resumable/session uploads instead of just tell them to use google drive
						// haha i'm being sloppy here! :-p
						res.send({'ERROR':'We apologize that we are currently still working on the large file transfer function ' 
						+ 'for dropbox. Please switch to Google Drive uploads.'});
					}
			}else{
				console.log('Dropbox token has expired!!');
				res.send({'ERROR':'Dropbox token has expired. Please authorize again!'});
			}
		
		
		
		}else if (req.body.id == 'box-export'){
			if (req.session.box_access_token !== undefined){
				var sdk = new BoxSDK({
				  clientID: '***REMOVED***',
				  clientSecret: '***REMOVED***'
				});
				var client = sdk.getBasicClient(req.session.box_access_token);
				
				if (filesize <= 50*1024*1024){
					client.files.uploadFile('0', filename, buffer, function(err, response) {
						if (err){
							console.log(err);
							res.send({'ERROR':err})
						}else{
							fs.unlinkSync('./downloads/' + filename)
							res.send(response);
						}
					});
				}else{
				
					client.files.getChunkedUploader('0',filesize, filename,buffer, null, function(err,uploader){
						if (err){
							console.log(err);
							res.send({'ERROR':err})
						}else{
							uploader.on('error',function(err){
								res.send({'ERROR':err})
							});
							
							uploader.on('uploadComplete',function(response){
								fs.unlinkSync('./downloads/' + filename)
								res.send(response);
							});
							
							uploader.start();
						}
					});
					
				}
					
			}else{
				console.log('Dropbox token has expired!!');
				res.send({'ERROR':'Dropbox token has expired. Please authorize again!'});
			}
		}
	
	}else{
		res.send({'ERROR':'You don\'t have any data associate with this session. Nothing to export!'});
	}
	  
});

function zipDownloads(){
	// zip it first
	var zip = new admzip();
	zip.addLocalFolder('downloads','/');
	var outputFilename = 'SMILE-' + Date.now() + '.zip';
	zip.writeZip('downloads/' + outputFilename);
	
	return outputFilename;
	
}

module.exports = router;