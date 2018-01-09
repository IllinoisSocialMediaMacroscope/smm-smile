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

router.get('/text-classification',function(req,res,next){
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
		
		res.render('analytics/text-classification',{parent:'/#Clustering', title:'Text Classification', directory:directory}); 
	});
});
 
router.post('/text-classification-split',function(req,res,next){
	
	if (req.body.selectFile === 'Please Select...'){
		res.end('no file selected!');
		
	}else{
		
		lambda_invoke('lambda_classification_split',
			{'remoteReadPath':req.body.prefix, 
			'ratio':req.body.ratio,
			's3FolderName':req.body.s3FolderName})
		.then(results =>{
			//console.log(results);
			var uuid = results['uuid'];
			var div = results['div'];
			var training = results['training']
			var testing = results['testing'];
				
				getMultiRemote(div).then(value =>{
					div_data = value;			
					res.send({
						uuid:uuid,
						title:'Partial data generated for labeling and training', 
						img:[{name:'Split the corpus',content:div_data}],
						download:[{name:'Download training dataset', content:training},
							{name:'Download unlabeled dataset',content:testing}]
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
			var uuid = results['uuid'];
			var accuracy = results['accuracy'];
			var pickle = results['pickle'];
			var div = results['div']
			var metrics = results['metrics'];
			
			var promise_array = [];
			promise_array.push(getMultiRemote(div));
			promise_array.push(getMultiRemote(accuracy));
			promise_array.push(getMultiRemote(metrics));
			Promise.all(promise_array).then( values => {
				var div_data = values[0];
				
				var accuracy_string = values[1];	
				var accuracy_array = CSV.parse(accuracy_string);
				
				var preview_string = values[2];
				var preview_arr = CSV.parse(preview_string);
			
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
					
			var uuid = results['uuid'];
			var predict = results['predict'];
			var div = results['div'];
			
			var promise_array = [];
			promise_array.push(getMultiRemote(div));
			promise_array.push(getMultiRemote(predict));
			Promise.all(promise_array).then( values => {
				var div_data = values[0]
				var preview_string = values[1];
				var preview_arr = CSV.parse(preview_string);
				
				res.send({
					uuid:uuid,
					img:[{name:'Count of each class',content:div_data}],
					download:[{name:'Predicted Class using trained model', content:predict}],
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
