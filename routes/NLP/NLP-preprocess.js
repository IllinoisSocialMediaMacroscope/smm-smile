require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var pythonShell = require('python-shell');
var CSV = require('csv-string');
var path = require('path');
var appPath = path.resolve('.');
var readDIR = require(appPath + '/scripts/helper').readDIR;

router.get('/NLP/preprocess',function(req,res,next){
	files = readDIR(process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL);	
	var formParam = require('./preprocess.json');
	res.render('analytics/formTemplate',{parent:'/#Pre-processing', title:'Natural Langurage PreProcessing', directory:files, param:formParam});
});
 
router.post('/NLP/preprocess',function(req,res,next){
	
	if (req.body.option === 'file' && req.body.selectFile !== 'Please Select'){
		var options = {
			pythonPath:process.env.PYTHONPATH,
			scriptPath:appPath + '/scripts/NLP/',
			args:['--format',req.body.option, '--content',process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL + '/'+  req.body.filename, '--column', req.body.selectFileColumn,
			'--process',req.body.model, '--tagger',req.body.tagger, '--source','twitter']
		};
		
		// different tokenizer for different social media
		/*if (req.body.selectFile.substr(0,7) === 'twitter'){
			options.args.push('twitter');
		
		}else if (req.body.selectFile.substr(0,6) === 'reddit'){
			options.args.push('reddit');
		}*/
		
	}else if (req.body.option === 'URL'){ 
		var options = {
			pythonPath:process.env.PYTHONPATH,
			scriptPath:appPath + '/scripts/NLP/',
			args:['--format',req.body.option, '--content',req.body.input, '--process',req.body.model, '--tagger',req.body.tagger]
		};	
	}
	
	pythonShell.run('preprocessing.py',options,function(err,results){
		if(err){ 
			//throw err;
			res.send({ERROR:err});	
		}else{
			var phrases = results[1];
			var filtered = results[2];
			var processed = results[3];
			var most_common = results[4];
			var div = results[5];
			var tagged = results[6];
			
			if (div.slice(-1) === '\r' || div.slice(-1) === '\n' || div.slice(-1) === '\t' || div.slice(-1) === '\0' || div.slice(-1) === ' '){
				var div_data = fs.readFileSync(div.slice(0,-1),'utf8');
			}else{
				var div_data = fs.readFileSync(div,'utf8');
			}
			
			if (phrases.slice(-1) === '\r' || phrases.slice(-1) === '\n' || phrases.slice(-1) === '\t' || phrases.slice(-1) === '\0' || phrases.slice(-1) === ' '){
				var sentence_array =  fs.readFileSync(phrases.slice(0,-1),'utf8').toString().split("\n");
			}else{
				var sentence_array =  fs.readFileSync(phrases,'utf8').toString().split("\n");
			}
			
			//console.log(sentence_array);
			
			var new_sentence_array = [];
			for (var i = 0, length= sentence_array.length; i<length; i++){
				new_sentence_array.push([sentence_array[i]]) //add [] to make it comply with google word tree requirement
			}
			
			if (most_common.slice(-1) === '\r' || most_common.slice(-1) === '\n' || most_common.slice(-1) === '\t' || most_common.slice(-1) === '\0' || most_common.slice(-1) === ' '){
				var most_common_array = fs.readFileSync(most_common.slice(0,-1),'utf8').toString().split("\n")[1];
			}else{
				var most_common_array = fs.readFileSync(most_common,'utf8').toString().split("\n")[1];
			}
			
			var most_freq_word = most_common_array.split(",")[0]
			
			res.send({
						title:'Natural Language PreProcessing', 
						img:[{name:'Word Distribution',content:div_data}],
							//{name:'Name Entity Recognition (top30)', content:div_NE_data}],
						download:[
							{name:'phrases', content:phrases},
							{name:'words', content:filtered},
							{name:'most common words by order', content:most_common},
							{name:req.body.model + ' text', content:processed},
							{name:req.body.tagger + ' text', content:tagged}],
							//{name:'name entity recognition' + 'text', content:NE}],
						table:{name:'word tree', content:new_sentence_array, root:most_freq_word},
						preview:'',						
					});		
		}
			
	});
}); 

module.exports = router;