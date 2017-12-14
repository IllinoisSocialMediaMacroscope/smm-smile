//require('dotenv').config();
var express = require('express');
var router = express.Router();
var pythonShell = require('python-shell');
var CSV = require('csv-string');
var path = require('path');
var multer = require('multer');
var upload = multer({dest:'uploads/'});
var appPath = path.dirname(path.dirname(__dirname));
var readDIR = require(path.join(appPath,'scripts','helper_func','helper.js')).readDIR;
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));

router.get('/text-classification',function(req,res,next){
	var files = readDIR('./downloads/GraphQL');	
	res.render('analytics/text-classification',{parent:'/#Clustering', title:'Text Classification', directory:files}); 
});
 
router.post('/text-classification-split',function(req,res,next){
	//console.log(req.body);
	
	
	if (req.body.selectFile === 'Please Select...'){
		res.end('no file selected!');
		
	}else{
		
		var options = {
			pythonPath:'C:/Users/cwang138/AppData/Local/Programs/Python/Python36-32/python.exe',
			//pythonPath:'/opt/python/bin/python3.4',
			pythonOptions:['-W ignore'],
			scriptPath:appPath + '/scripts/',
			args:['--appPath', appPath, 
				'--localReadPath', appPath + '/downloads/GraphQL/' + req.body.filename, 
				'--ratio', req.body.ratio, 
				'--filename', req.body.foldername,
				'--sessionID',req.body.sessionID				]
			};
			
		pythonShell.run('classification_split.py',options,function(err,results){
			if (err){
				console.log(err);
				res.send({'ERROR':err});
			}else{
				var uuid = results[0];
				var div = results[1];
				var training = results[2]
				var testing = results[3];
				
				var promise_array = [];
				promise_array.push(getMultiRemote(div));
				Promise.all(promise_array).then( values => {
					var div_data = values[0];
				
					res.send({
						uuid:uuid,
						title:'Partial data generated for labeling and training', 
						img:[{name:'Split the corpus',content:div_data}],
						download:[{name:'Download training dataset', content:training},
							{name:'Download unlabeled dataset',content:testing}]
					});
				}).catch( (error) =>{
				console.log(error);
				});
			
			}
		});
		
	
	}
		
});

router.post('/text-classification-train',upload.single('labeled'),function(req,res,next){
		
	var options = {
		pythonPath:'C:/Users/cwang138/AppData/Local/Programs/Python/Python36-32/python.exe',
		//pythonPath:'/opt/python/bin/python3.4',
		pythonOptions:['-W ignore'],
		scriptPath:appPath + '/scripts/',
		args:[	'--appPath', appPath, 
				'--file',req.file.path,
				'--uuid',req.body.uuid, 
				'--model',req.body.classifier,
				'--sessionID', req.body.sessionID ]
		};		

	pythonShell.run('classification_train.py',options,function(err,results){
		if (err){
			console.log(err);
			res.send({'ERROR':err});
		}else{
			var uuid = results[0];
			var accuracy = results[1];
			var pickle = results[2];
			var div = results[3]
			var metrics = results[4];
			
			var promise_array = [];
			promise_array.push(getMultiRemote(accuracy));
			promise_array.push(getMultiRemote(metrics));
			promise_array.push(getMultiRemote(div));
			Promise.all(promise_array).then( values => {
				var accuracy_string = values[0];	
				var accuracy_array = CSV.parse(accuracy_string);
				
				var preview_string = values[1];
				var preview_arr = CSV.parse(preview_string);
			
				var div_data = values[2];
				
				fs.unlinkSync(req.file.path);
				
				res.send({
					uuid:uuid,
					img:[{name:'ROC curves for each class',content:div_data}],
					download:[{name:'Perserved classification pipeline', content:pickle},
						{name:'Classification performance evaluation',content:metrics},
							{name:'Accuracy score for each fold', content:accuracy}],
					preview:[{name:'10 fold Cross validation accuracy score for each fold', content:accuracy_array,dataTable:false},
								{name:'10 fold Cross validation Evaluation of the performance',content:preview_arr,dataTable:false}]	
				});
			}).catch( (error) =>{
				console.log(error);
			});
			
		}
	});
						
});

router.post('/text-classification-predict',function(req,res,next){
		
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
				
				var options = {
					pythonPath:'C:/Users/cwang138/AppData/Local/Programs/Python/Python36-32/python.exe',
					//pythonPath:'/opt/python/bin/python3.4',
					pythonOptions:['-W ignore'],
					scriptPath:appPath + '/scripts/',
					args:['--uuid',req.body.uuid]
					};		
				pythonShell.run('classification_predict.py',options,function(err,results){
					if (err){
						console.log(err);
						res.send({'ERROR':err});
					}else{
						var uuid = results[0];
						var predict = results[1];
						var div = results[2]
						
						if (predict.slice(-1) === '\r' || predict.slice(-1) === '\n' || predict.slice(-1) === '\t' || predict.slice(-1) === '\0' || predict.slice(-1) === ' '){
							var preview_string = fs.readFileSync(predict.slice(0,-1),'utf8');
						}else{
							var preview_string = fs.readFileSync(predict,'utf8');
						}
						var preview_arr = CSV.parse(preview_string);
						
						if (div.slice(-1) === '\r' || div.slice(-1) === '\n' || div.slice(-1) === '\t' || div.slice(-1) === '\0' || div.slice(-1) === ' '){
							var div_data = fs.readFileSync(div.slice(0,-1),'utf8');
						}else{
							var div_data = fs.readFileSync(div,'utf8');
						}
						
						res.send({
							uuid:uuid,
							img:[{name:'Count of each class',content:div_data}],
							download:[{name:'Predicted Class using trained model', content:predict}],
							preview:[{name:'Preview of the predicted data ',content:preview_arr,dataTable:true}]	
						});
					}
				});
					
				
			}
		}
	});
	
});

module.exports = router;
