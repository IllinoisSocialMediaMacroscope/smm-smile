var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var list_folders = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_folders;
var lambda_invoke = require(path.join(appPath,'scripts','helper_func','lambdaHelper.js'));
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));
var submit_Batchjob = require(path.join(appPath,'scripts','helper_func','batchHelper.js'));
var uuidv4 = require(path.join(appPath,'scripts','helper_func','uuidv4.js'));

router.get('/networkx',function(req,res,next){
	var formParam = require('./networkx.json');	
	res.render('analytics/formTemplate',{parent:'/#Network Analysis', title:'NetworkX', param:formParam});
});

router.post('/networkx',function(req,res,next){
	
	var uid = uuidv4();
	
	if (req.body.selectFile !== 'Please Select...'){
		
		if(req.body.aws_identifier === 'lambda'){
			var args = {'remoteReadPath':req.body.prefix, 
					'layout':req.body.layout, 
					'relations':req.body.relations,
					's3FolderName':req.body.s3FolderName,
					'uid':uid
			}
			
			lambda_invoke('lambda_network_analysis', args).then( results =>{
				
				var config=results['config'];
				var d3js = results['d3js'];
				var gephi = results['gephi'];
				var pajek = results['pajek'];			
				var div= results['div'];		
				var assortativity = results['assortativity'];
				var node_attri = results['node_attributes'];
				var edge_attri = results['edge_attributes'];
				var strong_components = results['strong_components'];
				var weak_components = results['weak_components'];
				var triads = results['triads'];
	   
				var downloadFiles = [	
					{'name':'graph exported in GML (Gephi) format', 'content':gephi},
					{'name':'graph exported in JSON format', 'content':d3js},
					{'name':'graph exported in NET (Pajek) format', 'content':pajek},
					{'name':'assortativity', 'content':assortativity},
					{'name':'node attributes', 'content':node_attri},
					{'name':'edge attributes', 'content':edge_attri},
					{'name':'strongly connected components', 'content':strong_components},
					{'name':'weakly connected components', 'content':weak_components},
					{'name':'triads', 'content':triads},
					{'name':'configuration', 'content':config},
					{'name':'visualization', 'content':div}
				];
				
				getMultiRemote(div).then(div_data => {	
					res.send({
						title:'Network Analysis', 
						img:[{name:'Static Network Visualization',content:div_data}],
						download: downloadFiles,
						metrics:{name:'', content:''}, 
						preview:[],
						uid:uid
					});
				}).catch( err =>{
					// retreive remote div data error
					console.log(err);
					res.send({'ERROR':err});
				});
				
			}).catch( err =>{
				//lambda invoke error
				console.log(err);
				res.send({'ERROR':err});
			});
		}
		else if (req.body.aws_identifier === 'batch'){
			
			var jobName = req.body.s3FolderName + '_NW_sdk';
			var command = [ "python3.6", "/scripts/batch_network_analysis.py",
					"--remoteReadPath", req.body.prefix,
					"--layout", req.body.layout,
					"--relations", req.body.relations,
					"--s3FolderName", req.body.s3FolderName,
					"--email", req.body.email,
					"--uid", uid,
					"--sessionURL", req.body.sessionURL]
			
			submit_Batchjob(jobName,command).then(results =>{
				results['uid'] = uid;
				res.send(results);
			}).catch(err =>{
				res.send({ERROR:err});
			});
		}		
		
	}else{
		res.end('no file selected!');
	}
			
	
});
      
module.exports = router;
