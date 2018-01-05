var express = require('express');
var router = express.Router();
var CSV = require('csv-string');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var list_folders = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_folders;
var lambda_invoke = require(path.join(appPath,'scripts','helper_func','lambdaHelper.js'));
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));

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
		var args = {'remoteReadPath':req.body.prefix, 
				'layout':req.body.layout, 
				'relations':req.body.relations,
				's3FolderName':req.body.s3FolderName
		}
		
		lambda_invoke('lambda_network_analysis', args).then( results =>{
			
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
			];
			
			getMultiRemote(div).then(div_data => {	
				res.send({
					title:'Network Analysis', 
					img:[{name:'Static Network Visualization',content:div_data}],
					download: downloadFiles,
					metrics:{name:'', content:''}, 
					preview:[],
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
		
	}else{
		res.end('no file selected!');
	}
			
	
});
      
module.exports = router;