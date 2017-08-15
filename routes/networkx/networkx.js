require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var pythonShell = require('python-shell');
var CSV = require('csv-string');
var serverDIR = path.resolve('.');
var readDIR = require(serverDIR + '/scripts/helper.js').readDIR;
var rootDIR = path.resolve('.');

router.get('/networkx',function(req,res,next){
	var files = readDIR(process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL);
	delete files['twitter-User'];
	var formParam = require('./networkx.json');
	res.render('formTemplate',{parent:'/#Network Analysis', title:'NetworkX', directory:files, param:formParam}); 
});

router.post('/networkx',function(req,res,next){
	
	//console.log(req.body);
	
		
	var options = {
		args:[	'--file',process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL + '/'+   req.body.filename, 
				'--layout',req.body.layout, 
				'--relationships',req.body.relationships, 
				'--node_size',req.body.node_size,
				'--edge_width',req.body.edge_width ] 
	};
	
	var pyshell = new pythonShell(rootDIR +'/scripts/NetworkX/network_analysis.py',options); 
	
	var count = 0;
	downloadFiles = [];
	pyshell.on('message',function(message){
		if (count === 1){ div = message; }
		if (count >= 2) { 
			var fnameRegex = /\/(?=[^\/]*$)(.*).json/g
			var display_name = fnameRegex.exec(message)[1];
			downloadFiles.push({'name':display_name + ' metrics', 'content':message}); 
		}
		count += 1;
	});
		
	 
	pyshell.end(function(err){
		if(err){
			throw err;
			res.send({ERROR:err});	
		}
		else{
		
			var div_data = fs.readFileSync(div.slice(0,-1), 'utf8'); //trailing /r
			
			
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