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
	res.render('formTemplate',{parent:'/#Sentiment Analysis', title:'Sentiment Analysis', directory:files, param:formParam});
});
 
router.post('/NLP/sentiment',function(req,res,next){
	if (req.body.option === 'file' && req.body.selectFile !== 'Please Select...'){
		var options = {
			args:['--format',req.body.option, '--content',process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL + '/'+  req.body.filename, '--column', req.body.selectFileColumn]
		};
	}else if (req.body.option === 'URL'){
		var options = {
			args:['--format',req.body.option, '--content',req.body.input]
		};	
	}else{
		res.end('no file selected!');
	}
	
	var pyshell = new pythonShell(process.env.ROOTDIR +'/scripts/NLP/sentiment.py',options); 
		
	var count = 0;
	pyshell.on('message',function(message){
		// first line is filename
		if (count === 1){	div = message;	}
		if (count === 2){ 	doc_sentiment = message; } 
		if (count === 3){	sentiment = message; }
		if (count === 4){ 	negation = message; }
		if (count === 5){ 	allcap = message; }
		count += 1;
	});

	pyshell.end(function(err){
		if(err){ 
			throw err;
			//res.send({ERROR:err});
		}
		else{
		
			var div_data = fs.readFileSync(div.slice(0,-1), 'utf8'); //trailing /r 
			var preview_string = fs.readFileSync(sentiment.slice(0,-1), "utf8"); 
			var preview_arr = CSV.parse(preview_string);
			var compound = JSON.parse(fs.readFileSync(doc_sentiment.slice(0,-1)))['compound'];
			
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