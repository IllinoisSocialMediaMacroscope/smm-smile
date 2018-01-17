var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));
var list_folders = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_folders;
var lambda_invoke = require(path.join(appPath,'scripts','helper_func','lambdaHelper.js'));
var submit_Batchjob = require(path.join(appPath,'scripts','helper_func','batchHelper.js'));
var CSV = require('csv-string');

router.get('/NLP-sentiment',function(req,res,next){
		var formParam = require('./sentiment.json');
		res.render('analytics/formTemplate',{parent:'/#Sentiment Analysis', title:'Sentiment Analysis', param:formParam});
});
 


router.post('/NLP-sentiment',function(req,res,next){
	
	// according to report, under 10000 can be finished using lambda function, above 10000 should use batch
	
	if (req.body.selectFile !== 'Please Select...'){
		
		if(req.body.aws_identifier === 'lambda'){
			var args = {'remoteReadPath':req.body.prefix, 
					'column':req.body.selectFileColumn,
					's3FolderName':req.body.s3FolderName
			}
			
			lambda_invoke('lambda_sentiment_analysis', args).then(results =>{
				var div=results['div'];
				var doc_sentiment=results['doc'];
				var sentiment = results['sentiment'];
				var negation = results['negation'];
				var allcap = results['allcap'];
				
				var promise_array = [];
				promise_array.push(getMultiRemote(div));
				promise_array.push(getMultiRemote(sentiment));
				promise_array.push(getMultiRemote(doc_sentiment));
				Promise.all(promise_array).then( values => {
					var div_data = values[0]; 
					var preview_string = values[1];
					var preview_arr = CSV.parse(preview_string).slice(0,1001);
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
					//fetch s3 data error
					console.log(error);
					res.send({'ERROR':error});
				});
			}).catch( error =>{
				//lambda error then clear the s3 bucket
				res.send({'ERROR':JSON.stringify(error)});
			});
		}else if (req.body.aws_identifier === 'batch'){
			
			var jobName = req.body.s3FolderName + '_SA_sdk';
			var command = [ "python3.6", "/scripts/batch_sentiment_analysis.py",
					"--remoteReadPath", req.body.prefix,
					"--column", req.body.selectFileColumn,
					"--s3FolderName", req.body.s3FolderName,
					"--email", req.body.email]
			
			submit_Batchjob(jobName,command).then(results =>{
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
