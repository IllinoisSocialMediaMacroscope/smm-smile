var express = require('express');
var router = express.Router();
var fs = require('fs');
var pythonShell = require('python-shell');
var CSV = require('csv-string');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var readDIR = require(path.join(appPath,'scripts','helper_func','helper.js')).readDIR;
var request = require('request');
const getSize = require('get-folder-size');


router.get('/NLP-preprocess',function(req,res,next){
	files = readDIR('./downloads/GraphQL');	
	var formParam = require('./preprocess.json');
	res.render('analytics/formTemplate',{parent:'/#Pre-processing', title:'Natural Language PreProcessing', directory:files, param:formParam});
});
 
router.post('/NLP-preprocess',function(req,res,next){
		
	getSize('./downloads', function(err, size) {
		if (err) { res.send({'ERROR':err}); }
		else{ 
			var sizeMB = size / 1024 / 1024;
			console.log( sizeMB.toFixed(2) + ' Mb');
			
			//threshhold of 50MB for each user maybe?
			if (sizeMB >= 500){
				res.send({'ERROR':`You have accumulated a total ` + sizeMB.toFixed(2) + 'MB of data in your directory, which ' 
				 + 'reached the alarm of 500MB for each individual. Please go free up the space by visiting the HISTORY page '
				 + 'and delete some of the historical data. No furthur data ingestion or computation can be performed until your ' +
				'disk usage is below 500MB. We appreciate your understanding!'
				});
			}else{
				
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
						
						
						promise_array = [];
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
			}
				
		}
	});
		
	
}); 

function getMultiRemote(endpoint){
	
	if (endpoint.slice(-1) === '\r'){
		endpoint = endpoint.slice(0,-1)
	}						
	
	return new Promise((resolve,reject) =>{
		request.get(endpoint, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var data = body;
				resolve(data);
			}else{
				reject('error');
			}
		});
	});
		
};

module.exports = router;
