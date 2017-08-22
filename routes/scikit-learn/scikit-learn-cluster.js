require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var pythonShell = require('python-shell');
var CSV = require('csv-string');;
var readDIR = require(process.env.ROOTDIR + '/scripts/helper.js').readDIR;

router.get('/sklearn/cluster',function(req,res,next){
	var files = readDIR(process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL);	
	var formParam = require('./cluster.json');
	res.render('analytics/formTemplate',{parent:'/#Clustering', title:'Unsupervised Learning', directory:files, param:formParam}); 
});
 
router.post('/sklearn/cluster',function(req,res,next){
	//console.log(req.body);
	
	var options = {
		pythonPath:process.env.PYTHONPATH,
		scriptPath:process.env.ROOTDIR + '/scripts/ML/',
		args:['--file',process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL + '/'+   req.body.filename, '--estimator',req.body.model,'--n_clusters',req.body.n_clusters,'--fields']
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
			
			var cluster = results[1];
			var div = results[2];
			
			if (div.slice(-1) === '\r' || div.slice(-1) === '\n' || div.slice(-1) === '\t' || div.slice(-1) === '\0' || div.slice(-1) === ' '){
				var div_data = fs.readFileSync(div.slice(0,-1), 'utf8'); //trailing /r
			}else{
				var div_data = fs.readFileSync(div, 'utf8'); //trailing /r
			}
			
			if (cluster.slice(-1) === '\r' || cluster.slice(-1) === '\n' || cluster.slice(-1) === '\t' || cluster.slice(-1) === '\0' || cluster.slice(-1) === ' '){
				var preview_string = fs.readFileSync(cluster.slice(0,-1), "utf8"); 
			}else{
				var preview_string = fs.readFileSync(cluster, "utf8"); 
			}
			
			var preview_arr = CSV.parse(preview_string);
			
			res.send({
					title:'scikit-learn clustering', 
					img:[{name:'Clustering down-grade to 2D',content:div_data}],
					download:[{name:'Download clustered data', content:cluster}],
					preview:{name:'preview some of the clustered data',content:preview_arr}						
				});
		}
		
	});
	
});


module.exports = router;