//require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var pythonShell = require('python-shell');
var CSV = require('csv-string');
var path = require('path');
var multer = require('multer');
var upload = multer({dest:'uploads/'});
var appPath = path.dirname(path.dirname(__dirname));
var readDIR = require(path.join(appPath,'scripts','helper.js')).readDIR;
const getSize = require('get-folder-size');

router.get('/text-classification',function(req,res,next){
	var files = readDIR('./downloads/GraphQL');	
	res.render('analytics/text-classification',{parent:'/#Clustering', title:'Text Classification', directory:files}); 
});
 
router.post('/text-classification-split',function(req,res,next){
	//console.log(req.body);
	
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
				
				if (req.body.selectFile === 'Please Select...'){
					res.end('no file selected!');
					
				}else{
					
					var options = {
						pythonPath:'C:/Users/cwang138/AppData/Local/Programs/Python/Python36-32/python.exe',
						//pythonPath:'/opt/python/bin/python3.4',
						pythonOptions:['-W ignore'],
						scriptPath:appPath + '/scripts/ML/',
						args:['--content','./downloads/GraphQL/'+  req.body.filename, '--ratio', req.body.ratio, '--filename', req.body.foldername ]
						};				
					pythonShell.run('classification_split.py',options,function(err,results){
						if (err){
							res.send({'ERROR':err});
						}else{
							var uuid = results[0];
							var training = results[1];
							var testing = results[2];
							res.send({
								uuid:uuid,
								title:'Partial data generated for labeling and training', 
								download:[{name:'Download training dataset', content:training},
									{name:'Download testing dataset',content:testing}]				
							});
						}
					});
					
				
				}
			}
		}
	});
	
});

router.post('/text-classification-train',upload.single('labeled'),function(req,res,next){
		
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
					scriptPath:appPath + '/scripts/ML/',
					args:['--file',req.file.path,'--uuid',req.body.uuid]
					};				
				pythonShell.run('classification_train.py',options,function(err,results){
					if (err){
						res.send({'ERROR':err});
					}else{
						var uuid = results[0];
						var pickle = results[1];
						var metrics = results[2];
						
						if (metrics.slice(-1) === '\r' || metrics.slice(-1) === '\n' || metrics.slice(-1) === '\t' || metrics.slice(-1) === '\0' || metrics.slice(-1) === ' '){
							var preview_string = fs.readFileSync(metrics.slice(0,-1),'utf8');
						}else{
							var preview_string = fs.readFileSync(metrics,'utf8');
						}
						var preview_arr = CSV.parse(preview_string);
						
						fs.unlinkSync(req.file.path);
						
						res.send({
							uuid:uuid,
							download:[{name:'Perserved classification pipeline', content:pickle},
								{name:'Classification performance evaluation',content:metrics}],
							preview:{name:'Evaluation of the performance of the classification model ',content:preview_arr}	
						});
					}
				});
					
				
			}
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
					scriptPath:appPath + '/scripts/ML/',
					args:['--uuid',req.body.uuid]
					};		
				pythonShell.run('classification_predict.py',options,function(err,results){
					if (err){
						console.log(err);
						res.send({'ERROR':err});
					}else{
						var uuid = results[0];
						var predict = results[1];
						
						if (predict.slice(-1) === '\r' || predict.slice(-1) === '\n' || predict.slice(-1) === '\t' || predict.slice(-1) === '\0' || predict.slice(-1) === ' '){
							var preview_string = fs.readFileSync(predict.slice(0,-1),'utf8');
						}else{
							var preview_string = fs.readFileSync(predict,'utf8');
						}
						var preview_arr = CSV.parse(preview_string);
						
						res.send({
							uuid:uuid,
							download:[{name:'Predicted Class using trained model', content:predict}],
							preview:{name:'Preview of the predicted data ',content:preview_arr}	
						});
					}
				});
					
				
			}
		}
	});
	
});

module.exports = router;
