var fs = require('fs');

function readDIR(path){
	var structure = {};
	
	var directory = fs.readdirSync(path);
	for (var i=0; i<directory.length; i++){
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

	return structure;
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