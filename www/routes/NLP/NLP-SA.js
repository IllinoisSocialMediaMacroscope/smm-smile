//require('dotenv').config();
var express = require('express');
var router = express.Router();
var pythonShell = require('python-shell');
var CSV = require('csv-string'); 
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var readDIR = require(path.join(appPath,'scripts','helper_func','helper.js')).readDIR;
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));


router.get('/NLP-sentiment',function(req,res,next){
	var files = readDIR('./downloads/GraphQL');
	var formParam = require('./sentiment.json');
	res.render('analytics/formTemplate',{parent:'/#Sentiment Analysis', title:'Sentiment Analysis', directory:files, param:formParam});
});
 
router.post('/NLP-sentiment',function(req,res,next){
	if (req.body.selectFile !== 'Please Select...'){
		var options = {
			pythonPath:'C:/Users/cwang138/AppData/Local/Programs/Python/Python36-32/python.exe',
			//pythonPath:'/opt/python/bin/python3.4',
			pythonOptions:['-W ignore'],
			scriptPath:appPath + '/scripts/',
			args:['--appPath', appPath, 
				'--localReadPath', appPath + '/downloads/GraphQL/' + req.body.filename, 
				'--column', req.body.selectFileColumn,
				'--sessionID',req.body.sessionID 
			]
		};
	}else{
		res.end('no file selected!');
	}
	pythonShell.run('sentiment.py',options,function(err,results){
		if (err){
			console.log(err);
			res.send({'ERROR':err});
		}else{
			
			var div=results[1];
			var doc_sentiment=results[2];
			var sentiment = results[3];
			var negation = results[4];
			var allcap = results[5];
			
			var promise_array = [];
			promise_array.push(getMultiRemote(div));
			promise_array.push(getMultiRemote(sentiment));
			promise_array.push(getMultiRemote(doc_sentiment));
			
			Promise.all(promise_array).then( values => {
				var div_data = values[0];
				
				var preview_string = values[1];
				var preview_arr = CSV.parse(preview_string);
				
				var compound = values[2]['compound']
				
				res.send({
					title:'Sentiment Analysis',
					img:[{name:'Document Sentiment Composition',content:div_data}],
					compound:compound,
					download:[{name:'sentence-level sentiment scores',content:sentiment},
							{name:'Has negation words?',content:negation},
							{name:'Has some capital letter?',content:allcap}],
					preview:[{name:'Preview the sentiment scores for each sentence',content:preview_arr,dataTable:true}]
				});
			}).catch( (error) =>{
				console.log(error);
			});
		}
	});
				
}); 

module.exports = router;
