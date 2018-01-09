var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));
var list_folders = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_folders;
var lambda_invoke = require(path.join(appPath,'scripts','helper_func','lambdaHelper.js'));

router.get('/NLP-preprocess',function(req,res,next){
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
	
		var formParam = require('./preprocess.json');
		res.render('analytics/formTemplate',{parent:'/#Pre-processing', title:'Natural Language PreProcessing', directory:directory, param:formParam});
	});
});


router.post('/NLP-preprocess',function(req,res,next){
			
	if (req.body.selectFile !== 'Please Select'){
		
		var args = {'remoteReadPath':req.body.prefix, 
				'column':req.body.selectFileColumn,
				's3FolderName':req.body.s3FolderName,
				'source':'twitter', // bug here!
				'process':req.body.model,
				'tagger':req.body.tagger
		}
		
		lambda_invoke('lambda_preprocessing',args).then( results =>{
			
			var phrases = results['phrases'];
			var filtered = results['filtered'];
			var processed = results['processed'];
			var most_common = results['most_common'];
			var div = results['div'];
			var tagged = results['tagged'];
			
			var promise_array = [];
			promise_array.push(getMultiRemote(div));
			promise_array.push(getMultiRemote(phrases));
			promise_array.push(getMultiRemote(most_common));
			Promise.all(promise_array).then( values => {
			
				var div_data = values[0]; //trailing /r
				
				var sentence_array = values[1].toString().split("\n");
				var new_sentence_array = [];
				for (var i = 0, length= sentence_array.length; i<length; i++){
					new_sentence_array.push([sentence_array[i]]); //add [] to make it comply with google word tree requirement
				}
				
				var most_common_array = values[2].toString().split("\n")[1];
				var most_freq_word = most_common_array.split(",")[0];
				
				res.send({
					title:'Natural Language PreProcessing', 
					img:[{name:'Word Distribution',content:div_data}],
					download:[
						{name:'phrases', content:phrases},
						{name:'words', content:filtered},
						{name:'most common words by order', content:most_common},
						{name:req.body.model + ' text', content:processed},
						{name:req.body.tagger + ' text', content:tagged}],
					table:{name:'word tree', content:new_sentence_array, root:most_freq_word},
					preview:[],						
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
