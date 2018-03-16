var express = require('express');
var router = express.Router();
var archiver = require('archiver');
var fs = require('fs');
var config = require('../main_config');

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var Dropbox = require('dropbox');

var BoxSDK = require('box-node-sdk');

var path = require('path');
var appPath = path.dirname(__dirname);
var download_folder = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).download_folder;
var list_files = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_files;
var deleteLocalFolders = require(path.join(appPath,'scripts','helper_func','deleteDir.js'));

// this module is written terribly! TODO: re-write it so it's more human readable and friendly
// too much nested promises!! too much if else!!!
// not neccessary at all!!
// Chen 2018.01.02
router.post('/export',function(req,res,next){
	list_files(req.body.s3FolderName + '/').then(files =>{
		if (Object.keys(files).length === 0){
			res.send({'ERROR':'You don\'t have any data associate with this session. Nothing to export!'});
		}else{
			download_folder(req.body.s3FolderName + '/').then(files =>{
				
					var filename = 'SMILE-' + Date.now() + '.zip';
					zipDownloads(filename).then(() => {
						//get zip file size and decide which upload method to take
						var filesize = fs.statSync(filename).size;
						var buffer = fs.readFileSync(filename);
						
						if (req.body.id == 'googleDrive-export'){		
							if (req.session.google_access_token !== undefined){
											
								var oauth2Client = new OAuth2(config.google.client_id,
												config.google.client_secret, 'http://localhost:8001/login/google/callback');
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
										fs.unlinkSync(filename);
										deleteLocalFolders('./downloads').then(() =>{
											if (err){
												console.log(err);
												res.send({'ERROR':err});
											}else{
												res.send(response);
											}
										}).catch(err =>{
											console.log(err);
											res.send({ERROR:err});
										});
								});			
							}else{
								console.log('Goolge Drive token has expired!!');
								res.send({'ERROR':'Goolge Drive token has expired. Please authorize again!'});
							}
							
						}else if (req.body.id == 'dropbox-export'){
							if (req.session.dropbox_access_token !== undefined){
									//filesUpload(arg)
									//create a new file with the contents provided in the request. 
									//Do not use this to upload a file larger than 150 MB. Instead,
									//create an upload session with upload_session/start.
									var dbx = new Dropbox({ accessToken: req.session.dropbox_access_token });

									if (filesize <= 140*1024*1024){
										dbx.filesUpload({contents:buffer,
															path:'/' + filename,
															mode:{'.tag':'overwrite'},
															autorename:true,
															mute:false})
											.then(function(response){
												fs.unlinkSync(filename);
												deleteLocalFolders('./downloads').then(() =>{
													res.send(response);
												}).catch(err =>{
													console.log(err);
													res.send({ERROR:err});
												});
											}).catch(function(err){
												console.log(err);
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
								  clientID: config.box.client_id,
								  clientSecret: config.box.client_secret
								});
								var client = sdk.getBasicClient(req.session.box_access_token);
								
								if (filesize <= 50*1024*1024){
									client.files.uploadFile('0', filename, buffer, function(err, response) {
										fs.unlinkSync(filename);
										deleteLocalFolders('./downloads').then(() =>{
											if (err){
												console.log(err);
												res.send({'ERROR':err});
											}else{
												res.send(response);
											}
										});
									});
								}else{
								
									client.files.getChunkedUploader('0',filesize, filename,buffer, null, function(err,uploader){
										if (err){
											console.log(err);
											res.send({'ERROR':err})
										}else{
											uploader.on('error',function(err){
												fs.unlinkSync(filename);
												deleteLocalFolders('./downloads').then(() =>{
													console.log(err);
													res.send({'ERROR':err})
													
												});
											});
											
											uploader.on('uploadComplete',function(response){
												fs.unlinkSync(filename)
												deleteLocalFolders('./downloads').then(() =>{
													res.send(response);
												}).catch(err =>{
													// delete local folder error
													console.log(err);
													res.send({ERROR:err});
												});
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
						
						
					}).catch((err) => {
						// zip error
						console.log(err);
						res.send({ERROR:err});
					});				
			}).catch(err =>{
				// retrieve s3 error
				console.log(err);
				res.send({ERROR:err});
			});
		}
	}).catch(err =>{
		console.log(err);
		res.send({ERROR:err});
	});
	  
});

function zipDownloads(filename){
	
	return new Promise((resolve,reject) => {
		
		var archive = archiver('zip', {
			zlib: { level: 9 } // Sets the compression level.
		});
	
		var fileOutput = fs.createWriteStream(filename);
		fileOutput.on('close',function(){
			resolve(archive.pointer() + ' total bytes');
		});
	
		archive.on('error',function(err){
			console.log(err);
			reject(err);
		});
	
		archive.pipe(fileOutput);
		archive.directory('downloads','downloads');
		
		archive.finalize();
	});
	
}

module.exports = router;