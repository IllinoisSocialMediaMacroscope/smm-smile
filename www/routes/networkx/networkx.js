var express = require('express');
var router = express.Router();
var pythonShell = require('python-shell');
var CSV = require('csv-string');
var fs = require('fs');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var deleteFolderRecursive = require(path.join(appPath,'scripts','helper_func','deleteDir.js'));
var list_folders = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_folders;

router.get('/networkx',function(req,res,next){
	var directory = {};
							
	var promise_array = [];
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/twitter-Tweet/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/twitter-Stream/'));
	Promise.all(promise_array).then( values => {
		directory['twitter-Tweet'] = values[0];
		directory['twitter-Stream'] = values[1];
		var formParam = require('./networkx.json');	
		res.render('analytics/formTemplate',{parent:'/#Network Analysis', title:'NetworkX', directory:directory, param:formParam});
	});
	
	 
});

router.post('/networkx',function(req,res,next){
	
	if (req.body.selectFile !== 'Please Select...'){
		var options = {
			//pythonPath:'C:/Users/cwang138/AppData/Local/Programs/Python/Python36-32/python.exe',
			pythonPath:'/opt/python/bin/python3.4',
			pythonOptions:['-W ignore'],
			scriptPath:appPath + '/scripts/',
			args:[	// '--appPath', appPath, 
					'--remoteReadPath', req.body.prefix, 
					'--layout',req.body.layout, 
					'--relations',req.body.relations,
					'--s3FolderName',req.body.s3FolderName
				] 
		};
	}else{
		res.end('no file selected!');
	}
	
	pythonShell.run('network_analysis.py',options,function(err,results){
		if (err){
			console.log(err);
			res.send({'ERROR':err});
		}else{
			
			var localSavePath = results[0];
			var d3js = results[1];
			var gephi = results[2];
			var pajek = results[3];
			var div= results[results.length-1];
			
			var downloadFiles = [	
				{'name':'graph exported in GML (Gephi) format', 'content':gephi},
				{'name':'graph exported in JSON format', 'content':d3js},
				{'name':'graph exported in NET (Pajek) format', 'content':pajek}
			];
			
			for (var j=4; j< results.length-1; j++){
				var fnameRegex = /\/(?=[^\/]*$)(.*).csv/g;
				var display_name = fnameRegex.exec(results[j])[1];
				downloadFiles.push({'name':display_name, 'content':results[j]});
			}		
			
			if (div.slice(-1) === '\r') div = div.slice(0,-1);
			var div_data = fs.readFileSync(div, 'utf8'); //trailing /r
			
			// delete local path
			deleteFolderRecursive(localSavePath.slice(0,-1)); // no "/' in the end of the string
						
			res.send({
				title:'Network Analysis', 
				img:[{name:'Static Network Visualization',content:div_data}],
				download: downloadFiles,
				metrics:{name:'', content:''}, 
				preview:[],
			});
			
		}
	});

	
});
      
module.exports = router;