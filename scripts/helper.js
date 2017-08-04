var fs = require('fs');

function readDIR(path){
	//console.log(path);
	var directory = fs.readdirSync(path);
	
	for (var i = 0, length=directory.length; i<length; i++){
		// sepecially for reddit comments
		if (fs.statSync(path + '/' + directory[i] + '/').isDirectory()){
			var subfiles = fs.readdirSync(path +directory[i] +'/');
			subfiles.forEach(function(part,index,self){
				self[index] = directory[i] + '/' + self[index];
			});
			directory = directory.concat(subfiles);
		}
	}
	
	var twt = directory.filter(
		function(file){
			return (file.substr(0,7) === 'twitter' && file.substr(-4) === '.csv'); 
		});
	
	var rd = directory.filter(
		function(file){
			return (file.substr(0,6) === 'reddit' && file.substr(-4) === '.csv' && file.indexOf('/') < 0 ); 
		});
	
	var rd_replies = directory.filter(
		function(file){
			return (file.substr(0,6) === 'reddit' && file.substr(-4) === '.csv' && file.indexOf('/') > -1 ); 
		});
		
	return {"Twitter":twt, "Reddit":rd, "Reddit Replies":rd_replies};
}

function readZip(path){
	
	var directory = fs.readdirSync(path);
	var rd_replies = directory.filter(
		function(file){
			return (file.substr(0,6) === 'reddit' && file.substr(-4) === '.zip'); 
		});
		
	return {"Reddit Replies": rd_replies};
}

module.exports = {readDIR,readZip};