var fs = require('fs');

function readDIR(path){
	var structure = {};
	
	if (fs.existsSync(path)){
		var directory = fs.readdirSync(path);
		for (var i=0; i<directory.length; i++){
			if (directory[i] !== '.DS_Store'){
				var subdirectory = fs.readdirSync(path + '/' +directory[i]);
				var filelist =[];
				for (var j=0; j< subdirectory.length; j++){
					// check if it exist!
					var file =  path + '/' + directory[i] + '/' + subdirectory[j] + '/' + subdirectory[j] + '.csv';
						
					if (fs.existsSync(file)){
						filelist.push(subdirectory[j]);
					}
					
				}
			
				structure[directory[i]] = filelist;
			}
		}
	}

	return structure;
}

function traverseDirectory(dirname, callback) {
	var directory = [];
	fs.readdir(dirname, function(err, list) {
		dirname = fs.realpathSync(dirname);
		if (err) {
			return callback(err);
		}
    
		var listlength = list.length;
		list.forEach(function(file) {
			file = dirname + '\\' + file;
			fs.stat(file, function(err, stat) {	
				directory.push(file);
				if (stat && stat.isDirectory()) {
					traverseDirectory(file, function(err, parsed) {	
						directory = directory.concat(parsed);
						if (!--listlength) {
							callback(null, directory);
						}
					});
				} else {
					if (!--listlength) {
						callback(null, directory);
					}
				}
			});
		});
	});
}

function readZip(path){
	
	var directory = fs.readdirSync(path);
	var rd_replies = directory.filter(
		function(file){
			return (file.substr(0,6) === 'reddit' && file.substr(-4) === '.zip'); 
		});
		
	return {"Reddit Replies": rd_replies};
}

module.exports = {readDIR,readZip,traverseDirectory};