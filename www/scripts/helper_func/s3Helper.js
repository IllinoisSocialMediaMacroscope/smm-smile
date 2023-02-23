var AWS = require('aws-sdk');
var mime = require('mime');
var fs = require('fs');
var rmdir = require('rimraf');


class S3Helper {
	constructor(DOCKERIZED, AWS_ACCESSKEY, AWS_ACCESSKEYSECRET){
		//use minio for dockerized version
        if (process.env.HOST_IP){
            var hostIp = process.env.HOST_IP;
        }
        else {
            var hostIp = 'minio';
        }

		if (DOCKERIZED) {
			this.s3 = new AWS.S3({
				accessKeyId: AWS_ACCESSKEY,
				secretAccessKey: AWS_ACCESSKEYSECRET,
                endpoint: process.env.S3_URL,
				s3ForcePathStyle: true,
				signatureVersion: 'v4'
			});
		}
		// use AWS s3 bucket
		else {
			this.s3 = new AWS.S3({
				accessKeyId: AWS_ACCESSKEY,
				secretAccessKey: AWS_ACCESSKEYSECRET,
			})
		}
	}

    /**
     * upload local files to s3 bucket
     * @param localFile
     * @param remoteKey
     * @returns {Promise<any>}
     */
    uploadToS3(localFile, remoteKey){
        // make sure no space in file object in S3
        remoteKey = remoteKey.replace(/\s+/g, "_");

        return new Promise((resolve, reject) =>{
            var buffer = fs.readFileSync(localFile);
            var param = {
            	Bucket:BUCKET_NAME,
                Key: remoteKey,
                Body: buffer,
                ContentType:mime.getType(localFile)
            };

            var s3 = this.s3;
            s3.upload(param, function(err,data){
                if (err){
                    console.log(err);
                    reject(err);
                }else{
                    var fileURL = s3.getSignedUrl('getObject',{Bucket:BUCKET_NAME,Key:remoteKey, Expires:604800});
                    resolve(fileURL);
                }
            });
        })

    };

    list_folders(prefix){
        return new Promise((resolve,reject) =>{
            this.s3.listObjectsV2({
				Bucket:BUCKET_NAME,
				Prefix:prefix,
				Delimiter:'/'
			},function(err,data){
                if (err){
                    console.log(err);
                    reject(err);
                }

                var folderObj = {};
                var fileList = data.CommonPrefixes;
                if (fileList !== []){
                    for (var i=0, length=fileList.length; i< length; i++){
                        var folderID = fileList[i].Prefix.split('/').slice(-2)[0];
                        folderObj[folderID] = fileList[i].Prefix;
                    }
                }
                resolve(folderObj);
            });
        });

    };

    list_files(prefix){
        return new Promise((resolve,reject) =>{
            var s3 = this.s3;
            s3.listObjectsV2({
				Bucket:BUCKET_NAME,
				Prefix:prefix
			},function(err,data){
                if (err){
                    console.log(err);
                    reject(err);

                }else{

                    //if (!data.IsTruncated){

                    var folderObj = {};
                    var fileList = data.Contents;
                    for (var i=0, length=fileList.length; i< length; i++){
                        // generate downloadable URL
                        var filename = fileList[i].Key.split('/').slice(-1)[0];
                        var fileURL = s3.getSignedUrl('getObject',
                            {Bucket:BUCKET_NAME,Key:fileList[i].Key, Expires:604800});
                        folderObj[filename] = fileURL;
                    }

                    resolve(folderObj);
                }
            });
        });
    };

    download_folder(prefix, downloadPath){

        return new Promise((resolve,reject) =>{
            var s3 = this.s3;
            s3.listObjectsV2({
				Bucket:BUCKET_NAME,
				Prefix:prefix
			}, function(err,data){
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    if (!data.IsTruncated){
                        // create a place to hold the the downloaded files
                        if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

                        // create a promise array to hold all the downloads since it's async
                        var p_arr = [];

                        data.Contents.forEach(function(val,index,array){
                            // making the path
                            var path = val.Key.split('/');
                            var currPath = downloadPath;
                            for (var i=1, length=path.length-1; i< length; i++){
                                currPath += '/' + path[i];
                                if (!fs.existsSync(currPath)) fs.mkdirSync(currPath);
                            }
                            p_arr.push(new Promise((resolve,reject) =>{
                                s3.getObject({ Bucket:BUCKET_NAME, Key:val.Key},function(err,data){
                                    if (err){
                                        console.log(err,err.stack);
                                        reject(err);
                                    }else {
                                        fs.writeFile(currPath+'/'+path.slice(-1), data.Body, function(err){
                                            if (err) console.log(err);
                                            console.log('finished: ' + val.Key);
                                            resolve(val.Key);
                                        });
                                    }
                                });
                            }));

                        });

                        Promise.all(p_arr).then( values => {
                            resolve(values);
                        }).catch( err =>{
                            console.log(err);
                            reject(err);
                        });
                    }else{
                        reject('You have more than 1000 items in your folders, we cannot download or delete that many files. ' +
							'Please contact the administrator: TechServicesAnalytics@mx.uillinois.edu with your sessionID.');
                    }
                }
            });
        });

    };

    deleteRemoteFolder(prefix){

        return new Promise((resolve,reject) =>{
            var s3 = this.s3;
            s3.listObjectsV2({
				Bucket:BUCKET_NAME,
				Prefix:prefix
			},function(err,data){
                if (err){
                    // if not exist
                    console.log('cannot list error' + err);
                    resolve(err);
                }else{
                    if (data.KeyCount === 0){
                        console.log('There is no data in the folder you specified!');
                        resolve();
                    }else{
                        if (!data.IsTruncated){
                            var params = {
                            	Bucket: BUCKET_NAME,
                                Delete:{ Objects:[] }
                            };
                            data.Contents.forEach(function(content) {
                                params.Delete.Objects.push({Key: content.Key});
                            });

                            s3.deleteObjects(params, function(err, data) {
                                if(err){
                                    console.log('cannot delete err');
                                    reject(err);
                                }else{
                                    resolve();
                                }
                            });
                        }else{
                            reject('You have more than 1000 items in your folders, we cannot download or delete that many files. ' +
								'Please contact the administrator: TechServicesAnalytics@mx.uillinois.edu with your sessionID.');
                        }
                    }
                }
            })
        });
    };

    deleteLocalFolders(path){

        return new Promise(function(resolve, reject){
            if (fs.existsSync(path)){
                rmdir(path,function(error){
                    if (error){
                        console.log(error);
                        reject(error);
                    }else{
                        resolve('success');
                    }
                });
            }else{
                resolve('That local folder does not exist!');
            }
        });

    };
}


module.exports = S3Helper;
