var AWS = require('aws-sdk');
AWS.config.update({
	accessKeyId: '***REMOVED***', 
	secretAccessKey: '***REMOVED***' });
var s3 = new AWS.S3();
var fs = require('fs');

function uploadToS3(localFile, remoteKey){
	
	return new Promise((resolve, reject) =>{
				var buffer = fs.readFileSync(localFile);
				var param = {Bucket:'macroscope-smile', 
					Key: remoteKey, 
					Body: buffer};
				s3.upload(param, function(err,data){
						if (err){
							console.log(err);
							reject(err);
						}else{
							var fileURL = s3.getSignedUrl('getObject',{Bucket:'macroscope-smile',Key:remoteKey, Expires:604800});
							resolve(fileURL);
						}
					});
			})
			
}

function list_folders(prefix){
	return new Promise((resolve,reject) =>{
		s3.listObjectsV2({Bucket:'macroscope-smile',Prefix:prefix, Delimiter:'/'},function(err,data){
			if (err){
				console.log(err);
				reject(err);
			}			
			
			if (!data.IsTruncated){
				folderObj = {};
				
				var fileList = data.CommonPrefixes;
				if (fileList !== []){
					for (var i=0, length=fileList.length; i< length; i++){			
						var folderID = fileList[i].Prefix.split('/').slice(-2)[0];
						folderObj[folderID] = fileList[i].Prefix;
					}
				}
				resolve(folderObj);
			}else{
				reject('More than 1000 items!!');
			}
		});
	});
		
};

function list_files(prefix){
	return new Promise((resolve,reject) =>{
		s3.listObjectsV2({Bucket:'macroscope-smile',Prefix:prefix},function(err,data){
			if (err){
				console.log(err);
				reject(err);
				
			}else{
				if (!data.IsTruncated){
					
					var folderObj = {};
					var fileList = data.Contents;
					for (var i=0, length=fileList.length; i< length; i++){
						// generate downloadable URL
						var filename = fileList[i].Key.split('/').slice(-1)[0];
						var fileURL = s3.getSignedUrl('getObject',
									{Bucket:'macroscope-smile',Key:fileList[i].Key, Expires:604800});
						folderObj[filename] = fileURL;
					}

					resolve(folderObj);	
				}else{
					reject('More than 1000 items!!');
				}
			}
		});
	});					
}

var deleteRemoteFolder = function(prefix){
	
	return new Promise((resolve,reject) =>{
		s3.listObjectsV2({Bucket:'macroscope-smile',Prefix:prefix},function(err,data){
				if (err){
					console.log(err);
					reject(err);
				}else{
					if (!data.IsTruncated){
						params = { Bucket: 'macroscope-smile',
							Delete:{ Objects:[] }
						};
						data.Contents.forEach(function(content) {
							params.Delete.Objects.push({Key: content.Key});
						});
						
						s3.deleteObjects(params, function(err, data) {
							if(err){
								console.log(err);
								reject(err);
							}else{
							  resolve();
							}
						});
					}else{
						reject('More than 1000 items!!');
					}
				}
			});
	});

};


module.exports = {uploadToS3, list_folders, list_files, deleteRemoteFolder};
