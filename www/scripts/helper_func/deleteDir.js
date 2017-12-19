var fs = require('fs');
var AWS = require('aws-sdk');
AWS.config.update({
	accessKeyId: '***REMOVED***', 
	secretAccessKey: '***REMOVED***' });
var s3 = new AWS.S3();

var deleteFolderRecursive = function(path) {
  
  if( fs.existsSync(path) ) {
	
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


module.exports = deleteFolderRecursive;