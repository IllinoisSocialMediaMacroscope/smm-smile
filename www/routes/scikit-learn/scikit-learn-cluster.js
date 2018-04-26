//require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var pythonShell = require('python-shell');
var CSV = require('csv-string');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var readDIR = require(path.join(appPath,'scripts','helper.js')).readDIR;

router.get('/sklearn-cluster',function(req,res,next){
	var files = readDIR('./downloads/GraphQL');	
	var formParam = require('./cluster.json');
	res.render('analytics/formTemplate',{parent:'/#Clustering', title:'Unsupervised Learning', directory:files, param:formParam}); 
});
 
router.post('/sklearn-cluster',function(req,res,next){
	//console.log(req.body);
	
	var options = {
		pythonPath:'/opt/python/bin/python3.4',
		pythonOptions:['-W ignore'],
        scriptPath:appPath + '/scripts/ML/',
		args:['--file','./downloads/GraphQL/'+   req.body.filename, '--estimator',req.body.model,'--n_clusters',req.body.n_clusters,'--fields']
	}; 
		 
	//put multiple fields header into args
	if (Array.isArray(req.body.fields) === false){
		options.args.push(req.body.fields);
	} 
	else{ //multiple headers
		for (var i=0; i<req.body.fields.length;i++){
			if (req.body.fields[i] !== ''){options.args.push(req.body.fields[i])}
		}
	} 
	
	pythonShell.run('clustering.py',options,function(err,results){	
		if(err){ 
			//throw err;
			res.send({ERROR:err});	
		}else{
			var cluster_complete = results[1];
			var cluster_features = results[2];
			var div_comp = results[3]
			var div = results[4];
			
			if (div.slice(-1) === '\r' || div.slice(-1) === '\n' || div.slice(-1) === '\t' || div.slice(-1) === '\0' || div.slice(-1) === ' '){
				var div_data = fs.readFileSync(div.slice(0,-1),'utf8');
			}else{
				var div_data = fs.readFileSync(div,'utf8');
			}
			
			if (div_comp.slice(-1) === '\r' || div_comp.slice(-1) === '\n' || div_comp.slice(-1) === '\t' || div_comp.slice(-1) === '\0' || div_comp.slice(-1) === ' '){
				var div_comp_data = fs.readFileSync(div_comp.slice(0,-1),'utf8');
			}else{
				var div_comp_data = fs.readFileSync(div_comp,'utf8');
			}
			
			if (cluster_features.slice(-1) === '\r' || cluster_features.slice(-1) === '\n' || cluster_features.slice(-1) === '\t' || cluster_features.slice(-1) === '\0' || cluster_features.slice(-1) === ' '){
				var preview_string = fs.readFileSync(cluster_features.slice(0,-1),'utf8');
			}else{
				var preview_string = fs.readFileSync(cluster_features,'utf8');
			}
			
			var preview_arr = CSV.parse(preview_string);
			
			res.send({
					title:'scikit-learn clustering', 
					img:[{name:'Clustering down-grade to 2D',content:div_data},
						{name:'Composition of predicted clusters', content:div_comp_data}],
					download:[{name:'Download clustered data', content:cluster_complete},
						{name:'Download features and clustered label',content:cluster_features}],
					preview:{name:'preview some of the clustered data',content:preview_arr}						
				});
		}
		
	});
	
});


module.exports = router;
