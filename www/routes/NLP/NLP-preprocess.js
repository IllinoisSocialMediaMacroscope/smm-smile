var express = require('express');
var router = express.Router();
var pythonShell = require('python-shell');
var CSV = require('csv-string');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var readDIR = require(path.join(appPath,'scripts','helper_func','helper.js')).readDIR;
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));
//const getSize = require('get-folder-size');

router.get('/NLP-preprocess',function(req,res,next){
	files = readDIR('./downloads/GraphQL');	
	var formParam = require('./preprocess.json');
	res.render('analytics/formTemplate',{parent:'/#Pre-processing', title:'Natural Language PreProcessing', directory:files, param:formParam});
});
 
router.post('/NLP-preprocess',function(req,res,next){
		
	if (req.body.selectFile !== 'Please Select'){
		var options = {
			pythonPath:'C:/Users/cwang138/AppData/Local/Programs/Python/Python36-32/python.exe',
			//pythonPath:'/opt/python/bin/python3.4',
			pythonOptions:['-W ignore'],
			scriptPath:appPath + '/scripts/',
			args:['--appPath', appPath, 
			'--localReadPath', appPath + '/downloads/GraphQL/' + req.body.filename, 
			'--column', req.body.selectFileColumn,
			'--process',req.body.model, 
			'--tagger',req.body.tagger, 
			'--source','twitter',
			'--sessionID',req.body.sessionID ]
		};
	}else{
		res.end('no file selected!');
	}	
				
	pythonShell.run('preprocessing.py',options,function(err,results){
		if(err){ 
			console.log(err);
			res.send({ERROR:err});	
		}else{
			var phrases = results[1];
			var filtered = results[2];
			var processed = results[3];
			var most_common = results[4];
			var div = results[5];
			var tagged = results[6];
			
			
			var promise_array = [];
			promise_array.push(getMultiRemote(div));
			promise_array.push(getMultiRemote(phrases));
			promise_array.push(getMultiRemote(most_common));
			Promise.all(promise_array).then( values => {
				
				var div_data = values[0];
				
				var sentence_array = values[1].toString().split("\n");
				var new_sentence_array = [];
				for (var i = 0, length= sentence_array.length; i<length; i++){
					new_sentence_array.push([sentence_array[i]]) //add [] to make it comply with google word tree requirement
				}
				
				var most_common_array = values[2].toString().split("\n")[1];
				var most_freq_word = most_common_array.split(",")[0]
				
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
