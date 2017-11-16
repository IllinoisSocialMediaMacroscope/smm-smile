//require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var pythonShell = require('python-shell');
var CSV = require('csv-string');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var readDIR = require(path.join(appPath,'scripts','helper.js')).readDIR;
const getSize = require('get-folder-size');

router.get('/networkx',function(req,res,next){
	var files = readDIR('./downloads/GraphQL');
	
	delete files['twitter-User'];
	delete files['reddit-Search'];
	delete files['reddit-Post'];
	delete files['reddit-Comment'];
	delete files['reddit-Historical-Post'];
	delete files['reddit-Historical-Comment'];
	
	var formParam = require('./networkx.json');		
	res.render('analytics/formTemplate',{parent:'/#Network Analysis', title:'NetworkX', directory:files, param:formParam}); 
});

router.post('/networkx',function(req,res,next){
	getSize('./downloads', function(err, size) {
		if (err) { res.send({'ERROR':err}); }
		else{ 
			var sizeMB = size / 1024 / 1024;
			console.log( sizeMB.toFixed(2) + ' Mb');
			
			//threshhold of 50MB for each user maybe?
			if (sizeMB >= 500){
				res.send({'ERROR':`You have accumulated a total ` + sizeMB.toFixed(2) + 'MB of data in your directory, which ' 
				 + 'reached the alarm of 500MB for each individual. Please go free up the space by visiting the HISTORY page '
				 + 'and delete some of the historical data. No furthur data ingestion or computation can be performed until your ' +
				'disk usage is below 500MB. We appreciate your understanding!'
				});
			}else{
				
				if (req.body.selectFile !== 'Please Select...'){
					var options = {
						//pythonPath:'C:/Users/cwang138/AppData/Local/Programs/Python/Python36-32/python.exe',
						pythonPath:'/opt/python/bin/python3.4',
						pythonOptions:['-W ignore'],
						scriptPath:appPath + '/scripts/NetworkX/',
						args:[	'--file','./downloads/GraphQL/'+   req.body.filename, 
								'--layout',req.body.layout, 
								'--relations',req.body.relations
								//'--prune',req.body.prune
								//'--node_size',req.body.node_size,
								//'--edge_width',req.body.edge_width 
							] 
					};
				}else{
					res.end('no file selected!');
				}
				
				pythonShell.run('network_analysis.py',options,function(err,results){
					if (err){
						//throw err;
						res.send({'ERROR':err});
					}else{
						
						var d3js = results[1];
						var gephi = results[2];
						var pajek = results[3];
						var downloadFiles = [	{'name':'graph exported in GML (Gephi) format', 'content':gephi},
												{'name':'graph exported in JSON format', 'content':d3js},
												{'name':'graph exported in NET (Pajek) format', 'content':pajek}
												];
						
						for (var j=4; j< results.length-1; j++){
							var fnameRegex = /\/(?=[^\/]*$)(.*).csv/g;
							var display_name = fnameRegex.exec(results[j])[1];
							downloadFiles.push({'name':display_name, 'content':results[j]});
						}				
						var div= results[results.length-1];
						
						
						/*if (d3js.slice(-1)=== '\r' || d3js.slice(-1) === '\n' || d3js.slice(-1) === '\t' || d3js.slice(-1) === '\0' || d3js.slice(-1) === ' '){
							var d3js_data = JSON.parse(fs.readFileSync(d3js.slice(0,-1),'utf8'));
						}else{
							var d3js_data = JSON.parse(fs.readFileSync(d3js,'utf8'));
						}*/
						
						
						if (div.slice(-1) === '\r' || div.slice(-1) === '\n' || div.slice(-1) === '\t' || div.slice(-1) === '\0' || div.slice(-1) === ' '){
							var div_data = fs.readFileSync(div.slice(0,-1), 'utf8'); //trailing /r
						}else{
							var div_data = fs.readFileSync(div, 'utf8'); //trailing /r
						}
						
						res.send({
							title:'Network Analysis', 
							img:[{name:'Static Network Visualization',content:div_data}],
							download: downloadFiles,
							metrics:{name:'', content:''}, 
							preview:{name:'',content:''},
							//d3js_data:d3js_data
						});
						
					}
				});
				
			}
		}
	});
	
	
});
      
module.exports = router;