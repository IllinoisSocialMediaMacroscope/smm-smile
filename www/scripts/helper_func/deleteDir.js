var fs = require('fs');
var AWS = require('aws-sdk');
AWS.config.update({
	accessKeyId: '***REMOVED***', 
	secretAccessKey: '***REMOVED***' });
var s3 = new AWS.S3();

var deleteFolderRecursive = function(path) {
	
//console.log(fs.readdirSync('./downloads/NLP'))
  if( fs.existsSync(path) ) {

		fs.readdirSync(path).forEach(function(file,index){
		  var curPath = path + "/" + file;
		  
		  if(fs.lstatSync(curPath).isDirectory()) { 
			deleteFolderRecursive(curPath);
		  } else { 
			// delete file
			fs.unlinkSync(curPath);
			console.log('remove file' + curPath);
		  }
		});
	
	fs.rmdirSync(path + '/');
	console.log('remove folder' + path);
    
  }
  
};


module.exports = deleteFolderRecursive;