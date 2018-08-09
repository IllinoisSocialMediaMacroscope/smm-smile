var express = require('express');
var router = express.Router();
var path = require('path');
var multer = require('multer');
var upload = multer({dest:'uploads/'});
var appPath = path.dirname(path.dirname(__dirname));
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));
var list_folders = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_folders;
var uploadToS3 = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).uploadToS3;
var lambda_invoke = require(path.join(appPath,'scripts','helper_func','lambdaHelper.js'));
var uuidv4 = require(path.join(appPath,'scripts','helper_func','uuidv4.js'));
var CSV = require('csv-string');
var fs = require('fs');

router.get('/text-classification',function(req,res,next){
	res.render('analytics/text-classification',{parent:'/#Clustering', title:'Text Classification'}); 
});
 
router.post('/text-classification-split',function(req,res,next){
	
	if (req.body.selectFile === 'Please Select...'){
		res.end('no file selected!');
		
	}else{
		
		var uid = uuidv4();
		
		lambda_invoke('lambda_classification_split',
			{'remoteReadPath':req.body.prefix, 
			'ratio':req.body.ratio,
			's3FolderName':req.body.s3FolderName,
			'uid':uid })
		.then(results =>{
			//console.log(results);
			var config = results['config'];
			var uuid = results['uuid'];
			var div = results['div'];
			var training = results['training']
			var testing = results['testing'];
			
			var download = [{'name':'Download training dataset', content:training},
							{'name':'Download unlabeled dataset',content:testing},
							{'name':'configuration', 'content':config},
							{'name':'visualization', 'content':div}]
				
				getMultiRemote(div).then(value =>{
					div_data = value;			
					res.send({
						uuid:uuid,
						title:'Partial data generated for labeling and training', 
						img:[{name:'Split the corpus',content:div_data}],
						download:download
					});
				}).catch(err =>{
					console.log(err);
					res.send({ERROR:err});
				});
			
		}).catch(err => {
			console.log(err);
			res.send({ERROR:err});
		});
				
	}
			
});

router.post('/text-classification-train',upload.single('labeled'),function(req,res,next){
	
	var filename = 'LABELED_' + req.file.originalname;
	
	uploadToS3(req.file.path, req.body.s3FolderName + '/ML/classification/' + req.body.uuid + '/' + filename).then(url => {
		
		var remoteReadPath = req.body.s3FolderName + '/ML/classification/' + req.body.uuid + '/';
		fs.unlinkSync(req.file.path);
		
		lambda_invoke('lambda_classification_train',
			{'remoteReadPath':remoteReadPath, 
			'labeledFilename':filename,
			'uuid':req.body.uuid,
			'model':req.body.classifier,
			's3FolderName':req.body.s3FolderName})
		.then(results =>{
			var config = results['config'];
			var uuid = results['uuid'];
			var accuracy = results['accuracy'];
			var pickle = results['pickle'];
			var div = results['div']
			var metrics = results['metrics'];
			
			var download = [{'name':'Perserved classification pipeline', content:pickle},
							{'name':'Classification performance evaluation',content:metrics},
							{'name':'Accuracy score for each fold', content:accuracy},
							{'name':'configuration', 'content':config},
							{'name':'visualization', 'content':div}]
			
			var promise_array = [];
			promise_array.push(getMultiRemote(div));
			promise_array.push(getMultiRemote(accuracy));
			promise_array.push(getMultiRemote(metrics));
			Promise.all(promise_array).then( values => {
				var div_data = values[0];
				
				var accuracy_string = values[1];	
				var accuracy_array = CSV.parse(accuracy_string);
				
				var preview_string = values[2];
				var preview_arr = CSV.parse(preview_string).slice(0,1001);
			
				res.send({
					uuid:uuid,
					img:[{name:'10 fold Cross Validation Accuracy Score',content:div_data}],
					download:download,
					preview:[{name:'10 fold Cross validation Evaluation of the performance',content:preview_arr,dataTable:false}]
				});

			}).catch( (error) =>{
				// getmultiremote error
				console.log(error);
				res.send({ERROR:error});
			});
		
		}).catch(err =>{
			// lambda function error
			console.log(err);
			res.send({ERROR: err});
		});
			
		
	}).catch(err =>{
		//upload labeled data error
		fs.unlinkSync(req.file.path);
		console.log(err);
		res.send({ERROR: err});
	});
		
	
});

router.post('/text-classification-predict',function(req,res,next){
	lambda_invoke('lambda_classification_predict',
		{'remoteReadPath':req.body.prefix, 
			'uuid':req.body.uuid,
			's3FolderName':req.body.s3FolderName})
		.then(results =>{
			var config = results['config'];
			var uuid = results['uuid'];
			var predict = results['predict'];
			var div = results['div'];
			var download = [{'name':'Predicted Class using trained model', content:predict},
							{'name':'configuration', 'content':config},
							{'name':'visualization', 'content':div}]
			
			var promise_array = [];
			promise_array.push(getMultiRemote(div));
			promise_array.push(getMultiRemote(predict));
			Promise.all(promise_array).then( values => {
				var div_data = values[0]
				var preview_string = values[1];
				var preview_arr = CSV.parse(preview_string).slice(0,1001);
				
				res.send({
					uuid:uuid,
					img:[{name:'Count of each class',content:div_data}],
					download:download,
					preview:[{name:'Preview of the predicted data ',content:preview_arr,dataTable:true}]	
				});
			
			}).catch( (error) =>{
				console.log(error);
				res.send({ERROR:error});
			});
		}).catch( err =>{
			console.log(err);
			res.send({ERROR:err});
		});
		
});

module.exports = router;
