var express = require('express');
var router = express.Router();
var archiver = require('archiver');
var fs = require('fs');
var config = require('../../main_config');

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var Dropbox = require('dropbox');

var BoxSDK = require('box-node-sdk');

var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var download_folder = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).download_folder;
var list_files = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_files;
var deleteLocalFolders = require(path.join(appPath,'scripts','helper_func','deleteDir.js'));

// if smile home folder doesn't exist, create one
if (!fs.existsSync(smileHomePath)) {
    fs.mkdirSync(smileHomePath);
}
var downloadPath = path.join(smileHomePath, 'downloads');

router.post('/export',function(req,res,next){
	list_files(s3FolderName + '/').then(files =>{
		if (Object.keys(files).length === 0){
			res.send({'ERROR':'You don\'t have any data associate with this session. Nothing to export!'});
		}else{
			download_folder(s3FolderName + '/', downloadPath).then(files =>{
				
					var filename = 'SMILE-' + Date.now() + '.zip';
					zipDownloads(filename).then(() => {
						//get zip file size and decide which upload method to take
						var filesize = fs.statSync(filename).size;
						var buffer = fs.readFileSync(filename);
						if (req.body.id === 'google-export'){
							if (req.session.google_access_token !== undefined){
                                uploadToGoogle(filename, buffer, req.session.google_access_token)
									.then(response => {
										res.send({downloadUrl: response.alternateLink});
									})
									.catch(err => {
										res.send({ERROR: err});
									})
							}else{
								res.send({'ERROR':'Goolge Drive token has expired. Please authorize again!'});
							}
							
						}else if (req.body.id === 'dropbox-export'){
                            if (req.session.dropbox_access_token !== undefined && filesize <= 140*1024*1024){
                                uploadToDropbox(filename,buffer, req.session.dropbox_access_token)
								.then(response => {
                                    res.send({downloadUrl: 'https://www.dropbox.com/personal?preview=' + response.name});
                                })
                                .catch(err => {
                                    res.send({ERROR: err});
                                });
                            }else if (filesize > 140*1024*1024){
                                res.send({'ERROR':'We apologize that we are currently still working on the large file transfer function '
                                    + 'for dropbox. Please switch to Google Drive uploads.'});
                            }else{
                                res.send({'ERROR':'Dropbox token has expired. Please authorize again!'});
                            }
						
						}else if (req.body.id === 'box-export'){
							if (req.session.box_access_token !== undefined){
                                uploadToBox(filename, buffer, filesize, req.session.box_access_token)
                                .then(response => {
                                    res.send({downloadUrl: 'https://uofi.app.box.com/file/'+ response.entries[0].id});
                                })
                                .catch(err => {
                                    res.send({ERROR: err});
                                });
							}else{
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

router.post('/export-single', function(req,res){
    // check if the requested folder matches the current user's identity
    var arrURL = req.body.folderURL.split('/');
	if (arrURL[0] === s3FolderName) {
        var p = list_files(req.body.folderURL);
        p.then(files => {
            download_folder(req.body.folderURL, downloadPath).then(files => {
                var filename = arrURL[arrURL.length - 2] + '.zip';
                zipDownloads(filename).then(() => {
                    //get zip file size and decide which upload method to take
                    var filesize = fs.statSync(filename).size;
                    var buffer = fs.readFileSync(filename);
                    if (req.body.id === 'google-export') {
                        if (req.session.google_access_token !== undefined) {
                            uploadToGoogle(filename, buffer, req.session.google_access_token)
                            .then(response => {
                                res.send({downloadUrl: response.alternateLink});
                            })
                            .catch(err => {
                                res.send({ERROR: err});
                            });
                        } else {
                            res.send({'ERROR': 'Goolge Drive token has expired. Please authorize again!'});
                        }

                    } else if (req.body.id === 'dropbox-export') {
                        if (req.session.dropbox_access_token !== undefined && filesize <= 140 * 1024 * 1024) {
                            uploadToDropbox(filename, buffer, req.session.dropbox_access_token)
                            .then(response => {
                                res.send({downloadUrl: 'https://www.dropbox.com/personal?preview=' + response.name});
                            })
                            .catch(err => {
                                res.send({ERROR: err});
                            });
                        } else if (filesize > 140 * 1024 * 1024) {
                            res.send({
                                'ERROR': 'We apologize that we are currently still working on the large file transfer function '
                                + 'for dropbox. Please switch to Google Drive uploads.'
                            });
                        } else {
                            res.send({'ERROR': 'Dropbox token has expired. Please authorize again!'});
                        }

                    } else if (req.body.id === 'box-export') {
                        if (req.session.box_access_token !== undefined) {
                            uploadToBox(filename, buffer, req.session.box_access_token)
                            .then(response => {
                                res.send({downloadUrl: 'https://uofi.app.box.com/file/'+ response.entries[0].id});
                            })
                            .catch(err => {
                                res.send({ERROR: err});
                            });
                        } else {
                            res.send({'ERROR': 'Dropbox token has expired. Please authorize again!'});
                        }
                    }

                }).catch((err) => {
                    // zip error
                    console.log(err);
                    res.send({ERROR: err});
                });
            }).catch(err => {
                // retrieve s3 error
                console.log(err);
                res.send({ERROR: err});
            });
        }).catch(err => {
            // list s3 error
            console.log(err);
            res.send({ERROR: err});
        });
    }
    else {
        res.send({ERROR: "Access Denied!"});
    }
});

function uploadToGoogle(filename, buffer, google_access_token) {
	return new Promise((resolve,reject) =>{

		var oauth2Client = new OAuth2(
            config.google.client_id,
            config.google.client_secret,
            'http://localhost:8001/login/google/callback');
        oauth2Client.credentials = {'access_token': google_access_token}
        var drive = google.drive({version: 'v2', auth: oauth2Client});
        drive.files.insert(
            {
                resource:
                    {
                        title: filename,
                        mimeType: 'application/octet-stream'
                    },
                media:
                    {
                        body: buffer,
                        mimeType: 'application/octet-stream'
                    },
                type: 'resumable'
            }, function (err, response) {
                if (err) reject(err);
                else {
                    fs.unlinkSync(filename);
                    deleteLocalFolders(downloadPath).then(() => {
                    	resolve(response);
                    }).catch(err => {
                        reject(err);
                    });
				}
		});
    });
}

function uploadToDropbox(filename, buffer, dropbox_access_token){
    //filesUpload(arg)
    //create a new file with the contents provided in the request.
    //Do not use this to upload a file larger than 150 MB. Instead,
    //create an upload session with upload_session/start.
    return new Promise((resolve,reject) => {

    	var dbx = new Dropbox({accessToken: dropbox_access_token});
        dbx.filesUpload({
            contents: buffer,
            path: '/' + filename,
            mode: {'.tag': 'overwrite'},
            autorename: true,
            mute: false
        })
        .then(function(response) {
            fs.unlinkSync(filename);
            deleteLocalFolders(downloadPath).then(() => {
                resolve(response);
            }).catch(err => {
                reject(err);
            });
        }).catch(function (err) {
            reject(err);
        });

    });
}

function uploadToBox(filename, buffer, filesize, box_access_token){
    return new Promise((resolve,reject) => {

    	var sdk = new BoxSDK({
            clientID: config.box.client_id,
            clientSecret: config.box.client_secret
        });
        var client = sdk.getBasicClient(box_access_token);

        if (filesize <= 50 * 1024 * 1024) {
            client.files.uploadFile('0', filename, buffer, function (err, response) {
            	if (err) reject(err);
            	else{
                    fs.unlinkSync(filename);
                    deleteLocalFolders(downloadPath).then(() => {
                       resolve(response);
                    })
					.catch(err =>{
						reject(err);
					});
				}
            });
        }
        else {
            client.files.getChunkedUploader('0', filesize, filename, buffer, null, function (err, uploader) {
                if (err) {
                    reject(err);
                } else {
                    uploader.on('error', function (err) {
                        fs.unlinkSync(filename);
                        deleteLocalFolders(downloadPath).then(() => {
                            reject(err);
                        });
                    });

                    uploader.on('uploadComplete', function (response) {
                        fs.unlinkSync(filename)
                        deleteLocalFolders(downloadPath).then(() => {
                            resolve(response);
                        }).catch(err => {
                            reject(err);
                        });
                    });

                    uploader.start();
                }
            });
        }
    });
}

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
		archive.directory(downloadPath,'downloads');
		
		archive.finalize();
	});
	
}

module.exports = router;
