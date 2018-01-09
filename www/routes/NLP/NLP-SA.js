var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));
var list_folders = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_folders;
var lambda_invoke = require(path.join(appPath,'scripts','helper_func','lambdaHelper.js'));
var CSV = require('csv-string');

router.get('/NLP-sentiment',function(req,res,next){
	var directory = {};
							
	var promise_array = [];
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/twitter-Tweet/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/twitter-User/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/twitter-Stream/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/reddit-Search/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/reddit-Post/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/reddit-Comment/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/reddit-Historical-Post/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/reddit-Historical-Comment/'));
	Promise.all(promise_array).then( values => {
		
		directory['twitter-Tweet'] = values[0];
		directory['twitter-User'] = values[1];
		directory['twitter-Stream'] = values[2];
		directory['reddit-Search'] = values[3];
		directory['reddit-Post'] = values[4];
		directory['reddit-Comment'] = values[5];
		directory['reddit-Historical-Post'] = values[6];
		directory['reddit-Historical-Comment'] = values[7];
	
		var formParam = require('./sentiment.json');
		res.render('analytics/formTemplate',{parent:'/#Sentiment Analysis', title:'Sentiment Analysis', directory:directory, param:formParam});
	
	});
});
 


router.post('/NLP-sentiment',function(req,res,next){
	if (req.body.selectFile !== 'Please Select...'){
		
		var args = {'remoteReadPath':req.body.prefix, 
				'column':req.body.selectFileColumn,
				's3FolderName':req.body.s3FolderName
		}
		
		lambda_invoke('lambda_sentiment_analysis', args).then( results =>{
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
				//fetch s3 data error
				console.log(error);
				res.send({'ERROR':error});
			});
		}).catch( error =>{
			//invoke lambda function error
			console.log(error);
			res.send({'ERROR':error});
		});
		
	}else{
		res.end('no file selected!');
	}				
}); 

module.exports = router;
