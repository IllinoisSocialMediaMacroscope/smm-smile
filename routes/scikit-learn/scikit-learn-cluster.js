require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var pythonShell = require('python-shell');
var CSV = require('csv-string');
var serverDIR = path.resolve('.');
var readDIR = require(serverDIR + '/scripts/helper.js').readDIR;

router.get('/sklearn/cluster',function(req,res,next){
	var files = readDIR(process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL);	
	var formParam = require('./cluster.json');
	res.render('formTemplate',{parent:'/sklearn', title:'Unsupervised Learning', directory:files, param:formParam}); 
});
 
router.post('/sklearn/cluster',function(req,res,next){
	//console.log(req.body);
	
	var options = {
		args:['--file',process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL + '/'+   req.body.selectFile, '--estimator',req.body.model,'--n_clusters',req.body.n_clusters,'--fields']
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
		
	var pyshell = new pythonShell(process.env.ROOTDIR +'/scripts/ML/clustering.py',options);
	
	var count = 0;
	pyshell.on('message',function(message){
		if (count === 1){	cluster = message;	}
		if (count === 2){ 	div = message; } 
		count += 1;
	});
		
	pyshell.end(function(err){
		if(err){ 
			throw err;
			//res.send({ERROR:err});	
		}
		else{
		
			var div_data = fs.readFileSync(div.slice(0,-1), 'utf8'); //trailing /r 
			var preview_string = fs.readFileSync(cluster.slice(0,-1), "utf8"); 
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