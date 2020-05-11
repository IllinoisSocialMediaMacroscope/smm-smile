var express = require('express');
var router = express.Router();
var archiver = require('archiver');
var fs = require('fs');

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var Dropbox = require('dropbox');

var BoxSDK = require('box-node-sdk');

var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));


router.post('/export', checkIfLoggedIn, function(req,res,next){

    // if smile home folder doesn't exist, create one
    if (!fs.existsSync(smileHomePath)) {
        fs.mkdirSync(smileHomePath);
    }

    if (!fs.existsSync(path.join(smileHomePath, req.user.username))){
        fs.mkdirSync(path.join(smileHomePath, req.user.username));
    }

    var downloadPath = path.join(smileHomePath, req.user.username, 'downloads');

    redisClient.hgetall(req.user.username, function (err, obj) {
        s3.list_files(req.user.username + '/').then(files => {
            if (Object.keys(files).length === 0) {
                res.send({'ERROR': 'You don\'t have any data associate with this session. Nothing to export!'});
            } else {
                s3.download_folder(req.user.username + '/', downloadPath).then(files => {

                    var filename = 'SMILE-' + Date.now() + '.zip';
                    zipDownloads(filename, downloadPath).then(() => {
                        //get zip file size and decide which upload method to take
                        var filesize = fs.statSync(filename).size;
                        var buffer = fs.readFileSync(filename);
                        if (req.body.id === 'google-export') {
                            if (obj && obj['google_access_token'] !== undefined) {
                                uploadToGoogle(filename, buffer, obj['google_access_token'])
                                .then(response => {
                                    fs.unlinkSync(filename);
                                    s3.deleteLocalFolders(downloadPath).then(() => {
                                        res.send({downloadUrl: response.alternateLink});
                                    }).catch(s3DeleteError => {
                                        res.send({ERROR: s3DeleteError});
                                    });
                                })
                                .catch(err => {
                                    redisClient.hdel(req.user.username, 'google_access_token');
                                    res.send({ERROR: err});
                                })
                            } else {
                                res.send({'ERROR': 'Goolge Drive token has expired. Please authorize again!'});
                            }

                        } else if (req.body.id === 'dropbox-export') {
                            if (obj && obj['dropbox_access_token'] !== undefined && filesize <= 140 * 1024 * 1024) {
                                uploadToDropbox(filename, buffer, obj['dropbox_access_token'])
                                .then(response => {
                                    fs.unlinkSync(filename);
                                    s3.deleteLocalFolders(downloadPath).then(() => {
                                        res.send({downloadUrl: 'https://www.dropbox.com/personal?preview=' + response.name});
                                    }).catch(s3DeleteError => {
                                        res.send({ERROR: s3DeleteError});
                                    });
                                })
                                .catch(err => {
                                    redisClient.hdel(req.user.username, 'dropbox_access_token');
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
                            if (obj && obj['box_access_token'] !== undefined) {
                                uploadToBox(filename, buffer, filesize, obj['box_access_token'])
                                .then(response => {
                                    fs.unlinkSync(filename);
                                    s3.deleteLocalFolders(downloadPath).then(() => {
                                        res.send({downloadUrl: 'https://uofi.app.box.com/file/' + response.entries[0].id});
                                    }).catch(s3DeleteError => {
                                        res.send({ERROR: s3DeleteError});
                                    });
                                })
                                .catch(err => {
                                    redisClient.hdel(req.user.username, 'box_access_token');
                                    res.send({ERROR: err});
                                });
                            } else {
                                res.send({'ERROR': 'Dropbox token has expired. Please authorize again!'});
                            }
                        }

                    }).catch((zipError) => {
                        res.send({ERROR: zipError});
                    });
                }).catch(s3RetreiveError => {
                    res.send({ERROR: s3RetreiveError});
                });
            }
        }).catch(s3ListFileError => {
            res.send({ERROR: s3ListFileError});
        });
    });
	  
});

router.post('/export-single', checkIfLoggedIn, function(req,res){

    // if smile home folder doesn't exist, create one
    if (!fs.existsSync(smileHomePath)) {
        fs.mkdirSync(smileHomePath);
    }

    if (!fs.existsSync(path.join(smileHomePath, req.user.username))){
        fs.mkdirSync(path.join(smileHomePath, req.user.username));
    }

    var downloadPath = path.join(smileHomePath, req.user.username, 'downloads');

    redisClient.hgetall(req.user.username, function (err, obj) {
        // check if the requested folder matches the current user's identity
        // decide if multiuser or not
        var arrURL = req.body.folderURL.split('/');
        if (arrURL[0] === req.user.username) {
            var p = s3.list_files(req.body.folderURL);
            p.then(files => {
                s3.download_folder(req.body.folderURL, downloadPath).then(files => {
                    var filename = arrURL[arrURL.length - 2] + '.zip';
                    zipDownloads(filename, downloadPath).then(() => {
                        //get zip file size and decide which upload method to take
                        var filesize = fs.statSync(filename).size;
                        var buffer = fs.readFileSync(filename);
                        if (req.body.id === 'google-export') {
                            if (obj && obj['google_access_token'] !== undefined) {
                                uploadToGoogle(filename, buffer, obj['google_access_token'])
                                .then(response => {
                                    fs.unlinkSync(filename);
                                    s3.deleteLocalFolders(downloadPath).then(() => {
                                        res.send({downloadUrl: response.alternateLink});
                                    }).catch(s3DeleteError => {
                                        res.send({ERROR: s3DeleteError});
                                    });
                                })
                                .catch(err => {
                                    res.send({ERROR: err});
                                });
                            } else {
                                res.send({'ERROR': 'Goolge Drive token has expired. Please authorize again!'});
                            }

                        } else if (req.body.id === 'dropbox-export') {
                            if (obj && obj['dropbox_access_token'] !== undefined && filesize <= 140 * 1024 * 1024) {
                                uploadToDropbox(filename, buffer, obj['dropbox_access_token'])
                                .then(response => {
                                    fs.unlinkSync(filename);
                                    s3.deleteLocalFolders(downloadPath).then(() => {
                                        res.send({downloadUrl: 'https://www.dropbox.com/personal?preview=' + response.name});
                                    }).catch(s3DeleteError => {
                                        res.send({ERROR: s3DeleteError});
                                    });
                                })
                                .catch(err => {
                                    redisClient.hdel(req.user.username, 'dropbox_access_token');
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
                            if (obj && obj['box_access_token'] !== undefined) {
                                uploadToBox(filename, buffer, obj['box_access_token'])
                                .then(response => {
                                    s3.deleteLocalFolders(downloadPath).then(() => {
                                        res.send({downloadUrl: 'https://uofi.app.box.com/file/' + response.entries[0].id});
                                    }).catch(s3DeleteError => {
                                        res.send({ERROR: s3DeleteError});
                                    });
                                })
                                .catch(err => {
                                    redisClient.hdel(req.user.username, 'box_access_token');
                                    res.send({ERROR: err});
                                });
                            } else {
                                res.send({'ERROR': 'Dropbox token has expired. Please authorize again!'});
                            }
                        }

                    }).catch((zipError) => {
                        res.send({ERROR: zipError});
                    });
                }).catch(s3RetreiveError => {
                    res.send({ERROR: s3RetreiveError});
                });
            }).catch(s3ListFileError => {
                res.send({ERROR: s3ListFileError});
            });
        }
        else {
            res.send({ERROR: "Access Denied!"});
        }
    });
});

function uploadToGoogle(filename, buffer, google_access_token) {
	return new Promise((resolve,reject) =>{

		var oauth2Client = new OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
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
                else resolve(response);
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
            resolve(response);
        }).catch(function (err) {
            reject(err);
        });

    });
}

function uploadToBox(filename, buffer, filesize, box_access_token){
    return new Promise((resolve,reject) => {

    	var sdk = new BoxSDK({
            clientID: BOX_CLIENT_ID,
            clientSecret: BOX_CLIENT_SECRET
        });
        var client = sdk.getBasicClient(box_access_token);

        if (filesize <= 50 * 1024 * 1024) {
            client.files.uploadFile('0', filename, buffer, function (err, response) {
            	if (err) reject(err);
            	else{
            	    resolve(response);
				}
            });
        }
        else {
            client.files.getChunkedUploader('0', filesize, filename, buffer, null, function (err, uploader) {
                if (err) {
                    reject(err);
                } else {
                    uploader.on('error', function (err) {
                        reject(err);
                    });

                    uploader.on('uploadComplete', function (response) {
                        resolve(response);
                    });

                    uploader.start();
                }
            });
        }
    });
}

function zipDownloads(filename, downloadPath){
	
	return new Promise((resolve,reject) => {
		
		var archive = archiver('zip', {
			zlib: { level: 9 } // Sets the compression level.
		});
	
		var fileOutput = fs.createWriteStream(filename);
		fileOutput.on('close',function(){
			resolve(archive.pointer() + ' total bytes');
		});
	
		archive.on('error',function(err){
			reject(err);
		});
	
		archive.pipe(fileOutput);
		archive.directory(downloadPath,'downloads');
		
		archive.finalize();
	});
	
}

module.exports = router;
