require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var pythonShell = require('python-shell');
var CSV = require('csv-string');
var path = require('path');
var appPath = path.resolve('.');
var readZip = require(appPath  + '/scripts/helper').readZip;

router.get('/NLP-topic',function(req,res,next){
	files = readZip(process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL);	
	var formParam = require('./topic.json');
	res.render('analytics/formTemplate',{parent:'/#Topic Modeling', title:'LDA Topic Modeling', directory:files, param:formParam});
});
 
router.post('/NLP-topic',function(req,res,next){
	
	var options = {
		pythonPath:'/opt/python/bin/python3.4',
		pythonOptions:['-W ignore'],
		scriptPath:appPath +'/NLP/',
		args:['--file',process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL + '/'+   req.body.selectZip, '--vectorizer',req.body.vectorizer, '--n_topics',req.body.n_topics, '--n_features',req.body.n_features]
	};
	
	//console.log(options);
	var pyshell = new pythonShell(process.env.ROOTDIR +'/scripts/NLP/topic.py',options);
	
	var count = 0;
	pyshell.on('message',function(message){
		//console.log(message);
		if (count === 1){ features = message; }
		if (count === 2){ div_features = message; }
		if (count === 3){ pyLDAvis = message; }
		if (count === 4){ topic = message; }
		
		count += 1;
	});
		
	pyshell.end(function(err){
		if(err){
			//throw err;
			res.send({ERROR:err});	
		}
		else{
			if (div_features.slice(-1) === '\r' || div_features.slice(-1) === '\n' || div_features.slice(-1) === '\t' || div_features.slice(-1) === '\0' || div_features.slice(-1) === ' '){
				var div_features_data = fs.readFileSync(div_features.slice(0,-1),'utf8');
			}else{
				var div_features_data = fs.readFileSync(div_features,'utf8');
			}
			
			if (topic.slice(-1) === '\r' || topic.slice(-1) === '\n' || topic.slice(-1) === '\t' || topic.slice(-1) === '\0' || topic.slice(-1) === ' '){
				var preview_string = fs.readFileSync(topic.slice(0,-1),'utf8');
			}else{
				var preview_string = fs.readFileSync(topic,'utf8');
			}
			
			var preview_arr = CSV.parse(preview_string);
			
			res.send({
					title:'Latent Dirichlet Allocation topic modeling', 
					img:[{name:'Feature Extraction',content:div_features_data}],
					download:[{name:'Extracted Features', content:features},
								{name:'top 100 words in each Topic',content:topic}],
					iframe:{name:'pyLDAvis tool',content:pyLDAvis},
					preview:{name:'Preview Top words in each Topic',content:preview_arr}					
				});
		}
	});
	
	
}); 

module.exports = router;