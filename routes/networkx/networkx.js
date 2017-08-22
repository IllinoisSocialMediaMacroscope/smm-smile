require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var pythonShell = require('python-shell');
var CSV = require('csv-string');
var readDIR = require(process.env.ROOTDIR + '/scripts/helper.js').readDIR;

router.get('/networkx',function(req,res,next){
	var files = readDIR(process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL);
	delete files['twitter-User'];
	var formParam = require('./networkx.json');
	res.render('analytics/formTemplate',{parent:'/#Network Analysis', title:'NetworkX', directory:files, param:formParam}); 
});

router.post('/networkx',function(req,res,next){
	
	var options = {
		pythonPath:process.env.PYTHONPATH,
		scriptPath:process.env.ROOTDIR + '/scripts/NetworkX/',
		args:[	'--file',process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL + '/'+   req.body.filename, 
				'--layout',req.body.layout, 
				'--relationships',req.body.relationships, 
				'--node_size',req.body.node_size,
				'--edge_width',req.body.edge_width ] 
	};
	
	pythonShell.run('network_analysis.py',options,function(err,results){
		if (err){
			//throw err;
			res.send({'ERROR':err});
		}else{
			
			var div= results[1];
			var downloadFiles = [];
			
			for (var j=2; j< results.length; j++){
				var fnameRegex = /\/(?=[^\/]*$)(.*).json/g;
				var display_name = fnameRegex.exec(results[j])[1];
				downloadFiles.push({'name':display_name + ' metrics', 'content':results[j]});
			}				
			
			if (div.slice(-1) === '\r' || div.slice(-1) === '\n' || div.slice(-1) === '\t' || div.slice(-1) === '\0' || div.slice(-1) === ' '){
				var div_data = fs.readFileSync(div.slice(0,-1), 'utf8'); //trailing /r
			}else{
				var div_data = fs.readFileSync(div, 'utf8'); //trailing /r
			}
			
			res.send({
				title:'Network Analysis', 
				img:[{name:'Network Visualization',content:div_data}],
				download: downloadFiles,
				metrics:{name:'', content:''}, 
				preview:{name:'',content:''}						
			});
			
		}
	});
	
});
      
module.exports = router;