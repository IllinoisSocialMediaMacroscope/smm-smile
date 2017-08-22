require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var pythonShell = require('python-shell');
var CSV = require('csv-string'); 
var readDIR = require(process.env.ROOTDIR + '/scripts/helper.js').readDIR;

router.get('/NLP/sentiment',function(req,res,next){
	//console.log(process.env.ROOTDIR);
	var files = readDIR(process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL);
	var formParam = require('./sentiment.json');
	res.render('analytics/formTemplate',{parent:'/#Sentiment Analysis', title:'Sentiment Analysis', directory:files, param:formParam});
});
 
router.post('/NLP/sentiment',function(req,res,next){
	if (req.body.option === 'file' && req.body.selectFile !== 'Please Select...'){
		var options = {
			pythonPath:process.env.PYTHONPATH,
			scriptPath:process.env.ROOTDIR + '/scripts/NLP/',
			args:['--format',req.body.option, '--content',process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL + '/'+  req.body.filename, '--column', req.body.selectFileColumn]
		};
	}else if (req.body.option === 'URL'){
		var options = {
			pythonPath:process.env.PYTHONPATH,
			scriptPath:process.env.ROOTDIR + '/scripts/NLP/',
			args:['--format',req.body.option, '--content',req.body.input]
		};	
	}else{
		res.end('no file selected!');
	}
	
	pythonShell.run('sentiment.py',options,function(err,results){
		if (err){
			throw err;
		}else{
			
			var div=results[1];
			var doc_sentiment=results[2];
			var sentiment = results[3];
			var negation = results[4];
			var allcap = results[5];
			
			if (div.slice(-1) === '\r' || div.slice(-1) === '\n' || div.slice(-1) === '\t' || div.slice(-1) === '\0' || div.slice(-1) === ' '){
				var div_data = fs.readFileSync(div.slice(0,-1), 'utf8'); //trailing /r
			}else{
				var div_data = fs.readFileSync(div, 'utf8'); //trailing /r
			}
			
			if (sentiment.slice(-1) === '\r' || sentiment.slice(-1) === '\n' || sentiment.slice(-1) === '\t' || sentiment.slice(-1) === '\0' || sentiment.slice(-1) === ' '){
				var preview_string = fs.readFileSync(sentiment.slice(0,-1), "utf8"); 
			}else{
				var preview_string = fs.readFileSync(sentiment, "utf8");
			}
			
			var preview_arr = CSV.parse(preview_string);
			
			if (doc_sentiment.slice(-1) === '\r' || doc_sentiment.slice(-1) === '\n' || doc_sentiment.slice(-1) === '\t' || doc_sentiment.slice(-1) === '\0' || doc_sentiment.slice(-1) === ' '){
				var compound = JSON.parse(fs.readFileSync(doc_sentiment.slice(0,-1)))['compound']; 
			}else{
				var compound = JSON.parse(fs.readFileSync(doc_sentiment))['compound'];
			}
			
			
			res.send({
						title:'Sentiment Analysis',
						img:[{name:'Document Sentiment Composition',content:div_data}],
						compound:compound,
						download:[{name:'sentence-level sentiment scores',content:sentiment},
								{name:'Has negation words?',content:negation},
								{name:'Has some capital letter?',content:allcap}],
						preview:{name:'Preview the sentiment scores for each sentence',content:preview_arr}
					});
		}
	});
	
}); 

module.exports = router;