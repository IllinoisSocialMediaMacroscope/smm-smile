var express = require('express');
var router = express.Router();
var pythonShell = require('python-shell');
var CSV = require('csv-string');
var fs = require('fs');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));
var deleteFolderRecursive = require(path.join(appPath,'scripts','helper_func','deleteDir.js'));
var list_folders = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_folders;

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
		var options = {
			//pythonPath:'C:/Users/cwang138/AppData/Local/Programs/Python/Python36-32/python.exe',
			pythonPath:'/opt/python/bin/python3.4',
			pythonOptions:['-W ignore'],
			scriptPath:appPath + '/scripts/',
			args:[//'--appPath', appPath, 
			'--remoteReadPath', req.body.prefix, 
			'--column', req.body.selectFileColumn,
			'--process',req.body.model, 
			'--tagger',req.body.tagger, 
			'--source','twitter',
			'--s3FolderName',req.body.s3FolderName ]
		};
	}else{
		res.end('no file selected!');
	}	
	
	pythonShell.run('preprocessing.py',options,function(err,results){
		if(err){ 
			console.log(err);
			res.send({ERROR:err});	
		}else{
			var localSavePath = results[0];
			var phrases = results[1];
			var filtered = results[2];
			var processed = results[3];
			var most_common = results[4];
			var div = results[5];
			var tagged = results[6];
			
			var promise_array = [];
			// promise_array.push(getMultiRemote(div));
			promise_array.push(getMultiRemote(phrases));
			promise_array.push(getMultiRemote(most_common));
			Promise.all(promise_array).then( values => {
				
				if (div.slice(-1) === '\r') div = div.slice(0,-1);
				var div_data = fs.readFileSync(div, 'utf8'); //trailing /r
				
				var sentence_array = values[0].toString().split("\n");
				var new_sentence_array = [];
				for (var i = 0, length= sentence_array.length; i<length; i++){
					new_sentence_array.push([sentence_array[i]]) //add [] to make it comply with google word tree requirement
				}
				
				var most_common_array = values[1].toString().split("\n")[1];
				var most_freq_word = most_common_array.split(",")[0]
				
				// delete local path
				deleteFolderRecursive(localSavePath.slice(0,-1)); // no "/' in the end of the string
				
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
				console.log(error);
			})
			
			
		}
			
	});
}); 

module.exports = router;
