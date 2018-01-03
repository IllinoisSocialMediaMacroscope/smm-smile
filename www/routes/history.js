var express = require('express');
var router = express.Router();
var fs = require('fs');
var CSV = require('csv-string');
var path = require('path');
var appPath = path.dirname(__dirname);
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));
var deleteLocalFolders = require(path.join(appPath,'scripts','helper_func','deleteDir.js'));
var deleteRemoteFolder = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).deleteRemoteFolder;
var list_folders = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_folders;
var list_files = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_files;

router.get('/history',function(req,res,next){
	var directory = {
						"GraphQL":
							{"twitter-Tweet":{},
							"twitter-User":{},
							"twitter-Stream":{},
							"reddit-Search":{},
							"reddit-Comment":{},
							"reddit-Post":{},
							"reddit-Historical-Post":{},
							"reddit-Historical-Comment":{}
						},
						"ML":
						{
						//	"feature":{},
						//	"clustering":{}
							"classification":{}
						},
						"NLP":
							{"preprocessing":{},
							"sentiment":{}
							//"topic-modeling":{}
							},
						"NW":{"networkx":{}},
					}
	
	var promise_array = [];
	// session id instead of local here!!
	promise_array.push(list_folders(req.query.s3FolderName + '/ML/classification/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/NLP/preprocessing/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/NLP/sentiment/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/NW/networkx/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/twitter-Tweet/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/twitter-User/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/twitter-Stream/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/reddit-Search/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/reddit-Post/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/reddit-Comment/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/reddit-Historical-Post/'));
	promise_array.push(list_folders(req.query.s3FolderName + '/GraphQL/reddit-Historical-Comment/'));
	
	Promise.all(promise_array).then( values => {
		directory['ML']['classification'] = values[0];
		directory['NLP']['preprocessing'] = values[1];
		directory['NLP']['sentiment'] = values[2];
		directory['NW']['networkx'] = values[3];
		directory['GraphQL']['twitter-Tweet'] = values[4];
		directory['GraphQL']['twitter-User'] = values[5];
		directory['GraphQL']['twitter-Stream'] = values[6];
		directory['GraphQL']['reddit-Search'] = values[7];
		directory['GraphQL']['reddit-Post'] = values[8];
		directory['GraphQL']['reddit-Comment'] = values[9];
		directory['GraphQL']['reddit-Historical-Post'] = values[10];
		directory['GraphQL']['reddit-Historical-Comment'] = values[11];
		
		res.render('history',{parent:'/', directory: directory});
		
	}).catch( (err) => { 
		res.send({"ERROR":err}); 
	});
		
			
});

router.post('/history',function(req,res,next){
	
	var arrURL = req.body.folderURL.split('/');
	
	if (arrURL[1] === 'NLP' && arrURL[2] === 'preprocessing'){
		
		var p = list_files(req.body.folderURL);
		p.then(folderObj =>{

			var promise_array = [];	
			var fileList = Object.keys(folderObj);
			
			if(fileList.length === 7){
				for (var i=0, length=fileList.length; i< length; i++){
					var filename = fileList[i];
					if (filename === 'div.dat'){
						var div = folderObj[filename];
					}else if (filename === 'sentence.csv'){
						var phrases = folderObj[filename];
					}else if (filename === 'tokenized.csv'){
						var filtered = folderObj[filename];
					}else if (filename === 'frequent-rank.csv'){
						var most_common = folderObj[filename];
					}else if (filename === 'POStagged.csv'){
						var tagged = folderObj[filename];
					}else if (filename === 'config.dat'){
						var config = folderObj[filename];
					}else if (filename === 'lemmatized.csv' || filename === 'stemmed.csv' || filename === 'lemmatized-stemmed.csv'){
						var processed = folderObj[filename];
					}
				}	
			
				promise_array.push(getMultiRemote(div));
				promise_array.push(getMultiRemote(phrases));
				promise_array.push(getMultiRemote(most_common));
				promise_array.push(getMultiRemote(config));
				Promise.all(promise_array).then( values => {
					var div_data = values[0];
					
					var sentence_array = values[1].toString().split("\n");
					var new_sentence_array = [];
					for (var i = 0, length= sentence_array.length; i<length; i++){
						new_sentence_array.push([sentence_array[i]]) //add [] to make it comply with google word tree requirement
					}
					
					var most_common_array = values[2].toString().split("\n")[1];
					var most_freq_word = most_common_array.split(",")[0]
					
					var config = JSON.parse(values[3]);
										
					res.send({
						title:'Natural Language PreProcessing', 
						ID:req.body.folderURL,
						img:[{name:'Word Distribution',content:div_data}],
						download:[
							{name:'phrases', content:phrases},
							{name:'words', content:filtered},
							{name:'most common words by order', content:most_common},
							{name:'lemmatized/stemmed text', content:processed},
							{name:'POS tagged text', content:tagged}],
						table:{name:'word tree', content:new_sentence_array, root:most_freq_word},
						config:config				
					});
					
				});
			}else{
				res.send({ERROR:`Sorry! We cannot find a complete analytic history associated with this ID. You should double checked
				if you have fulfilled all the required  process when carrying out this analysis.`});
			}
		});	
	}
	else if (arrURL[1] === 'NLP' && arrURL[2] === 'sentiment'){
		var p = list_files(req.body.folderURL);
		p.then(folderObj =>{

			var promise_array = [];	
			var fileList = Object.keys(folderObj);
			
			if(fileList.length === 6){
				for (var i=0, length=fileList.length; i< length; i++){
					var filename = fileList[i];
					if (filename === 'div_sent.dat'){
						var div = folderObj[filename];
					}else if (filename === 'sentiment.csv'){
						var sentiment = folderObj[filename];
					}else if (filename === 'document.json'){
						var doc_sentiment = folderObj[filename];
					}else if (filename === 'negation.csv'){
						var negation = folderObj[filename];
					}else if (filename === 'allcap.csv'){
						var allcap = folderObj[filename];
					}else if (filename === 'config.dat'){
						var config = folderObj[filename];
					}
				}	
		
				promise_array.push(getMultiRemote(div));
				promise_array.push(getMultiRemote(sentiment));
				promise_array.push(getMultiRemote(doc_sentiment));
				promise_array.push(getMultiRemote(config));
				Promise.all(promise_array).then( values => {
					var div_data = values[0];
					var preview_string = values[1];
					var preview_arr = CSV.parse(preview_string);
					var compound = values[2]['compound']
					var config = JSON.parse(values[3]);
										
					res.send({
						title:'Sentiment Analysis',
						ID:req.body.folderURL,
						img:[{name:'Document Sentiment Composition',content:div_data}],
						compound:compound,
						download:[{name:'sentence-level sentiment scores',content:sentiment},
								{name:'Has negation words?',content:negation},
								{name:'Has some capital letter?',content:allcap}],
						preview:[{name:'Preview the sentiment scores for each sentence',content:preview_arr,dataTable:true}],
						config:config
					});
					
				});
		
			}else{
				res.send({ERROR:`Sorry! We cannot find a complete analytic history associated with this ID. You should double checked
				if you have fulfilled all the required  process when carrying out this analysis.`});
			}
		});		
}		
	else if (arrURL[1] === 'ML' && arrURL[2] === 'classification'){
		
		var p = list_files(req.body.folderURL);
		p.then(folderObj =>{

			var promise_array = [];	
			var fileList = Object.keys(folderObj);
			
			if(fileList.length === 10){
				for (var i=0, length=fileList.length; i< length; i++){
					var filename = fileList[i];
					if (filename === 'div_split.dat'){
						var div_data0 = folderObj[filename];
					}else if (filename === 'div.dat'){
						var div_data1 = folderObj[filename];
					}else if (filename === 'div_comp.dat'){
						var div_data2 = folderObj[filename];
					}else if (filename === 'accuracy_score.csv'){
						var accuracy = folderObj[filename];
					}else if (filename === 'classification_report.csv'){
						var metrics = folderObj[filename];
					}else if (filename === 'classification_pipeline.pickle'){
						var pickle = folderObj[filename];
					}else if (filename === 'config.dat'){
						var config = folderObj[filename];
					}else if (filename.slice(0,10) === 'PREDICTED_'){
						var predict = folderObj[filename];
					}else if (filename.slice(0,9) === 'TRAINING_'){
						var training = folderObj[filename];
					}else if (filename.slice(0,10) === 'UNLABELED_'){
						var testing = folderObj[filename];
					}
				}	
		
				promise_array.push(getMultiRemote(div_data0));
				promise_array.push(getMultiRemote(div_data1));
				promise_array.push(getMultiRemote(div_data2));
				promise_array.push(getMultiRemote(accuracy));
				promise_array.push(getMultiRemote(metrics));
				promise_array.push(getMultiRemote(predict));
				promise_array.push(getMultiRemote(config));
				Promise.all(promise_array).then( values => {
					var div_data0 = values[0];
					var div_data1 = values[1];
					var div_data2 = values[2];
					
					var preview_string1 = values[3];
					var preview_arr1 = CSV.parse(preview_string1);
					var preview_string2 = values[4];
					var preview_arr2 = CSV.parse(preview_string2);
					var preview_string3 = values[5];
					var preview_arr3 = CSV.parse(preview_string3);
					
					var config = JSON.parse(values[6]);
										
					res.send({
						title:'text classification', 
						ID:req.body.folderURL,
						img:[{name:'Split the Corpus', content:div_data0},
							{name:'ROC curves for each class',content:div_data1},
							{name:'Count of each class',content:div_data2}],
						download:[{name:'Download training dataset', content:training},
									{name:'Download unlabeled dataset',content:testing},
									{name:'Perserved classification pipeline', content:pickle},
									{name:'Classification performance evaluation',content:metrics},
									{name:'Accuracy score for each fold', content:accuracy},
									{name:'Predicted Class using trained model', content:predict}],
						preview:[{name:'Accuracy score for each fold',content:preview_arr1,dataTable:false},
								{name:'Preview training report',content:preview_arr2,dataTable:false},
									{name:'Predicted results',content:preview_arr3,dataTable:true}],
						config:config
					});
					
				});
			}else{
				res.send({ERROR:`Sorry! We cannot find a complete analytic history associated with this ID. You should double checked
				if you have fulfilled all the required  process when carrying out this analysis.`});
			}
		});			
		
	}
	else if (arrURL[1] === 'NW' && arrURL[2] === 'networkx'){
		
		var p = list_files(req.body.folderURL);
		p.then(folderObj =>{

			var promise_array = [];	
			var fileList = Object.keys(folderObj);
			
			if(fileList.length === 11){
				for (var i=0, length=fileList.length; i< length; i++){
					var filename = fileList[i];
					if (filename === 'div.dat'){
						var div = folderObj[filename];
					}else if (filename === 'config.dat'){
						var config = folderObj[filename];
					}else if (filename === 'd3js.json'){
						var d3js = folderObj[filename];
					}else if (filename === 'network.gml'){
						var gephi = folderObj[filename];
					}else if (filename === 'network.net'){
						var pajek = folderObj[filename];
					}else if (filename === 'assortativity.csv'){
						var assort = folderObj[filename];
					}else if (filename === 'edge_attributes.csv'){
						var edge = folderObj[filename];
					}else if (filename === 'node_attributes.csv'){
						var node = folderObj[filename];
					}else if (filename === 'strongly_connected_component.csv'){
						var strong = folderObj[filename];
					}else if (filename === 'triads.csv'){
						var triads = folderObj[filename];
					}else if (filename === 'weakly_connected_component.csv'){
						var weak = folderObj[filename];
					}
				}	
		
				promise_array.push(getMultiRemote(div));
				promise_array.push(getMultiRemote(config));
				Promise.all(promise_array).then( values => {
					var div_data = values[0];
					var config = JSON.parse(values[1]);
										
					res.send({
						title:'Network Analysis', 
						ID:req.body.folderURL,
						img:[{name:'Static Network Visualization',content:div_data}],
						download: [
							{'name':'graph exported in GML (Gephi) format', 'content':gephi},
							{'name':'graph exported in JSON format', 'content':d3js},
							{'name':'graph exported in NET (Pajek) format', 'content':pajek},
							{'name':'assortativity metrics', 'content':assort},
							{'name':'edge attributes','content':edge},
							{'name':'node attributes','content':node},
							{'name':'strongly connected component', 'content':strong},
							{'name':'weakly connected component', 'content':weak},
							{'name':'triads','content':triads}
						],
						preview:[],
						config: config,
					});
					
				});
			}else{
				res.send({ERROR:`Sorry! We cannot find a complete analytic history associated with this ID. You should double checked
				if you have fulfilled all the required  process when carrying out this analysis.`});
			}
		});			
					
	}
	else if (arrURL[1] === 'GraphQL' && 
		(arrURL[2] === 'twitter-Tweet' ||
		arrURL[2] === 'twitter-User' ||
		arrURL[2] === 'twitter-Stream' ||
		arrURL[2] === 'reddit-Comment' ||
		arrURL[2] === 'reddit-Historical-Comment')) {
					
		var p = list_files(req.body.folderURL);
		p.then(folderObj =>{

			var promise_array = [];	
			var fileList = Object.keys(folderObj);
			
			if(fileList.length === 2){
				for (var i=0, length=fileList.length; i< length; i++){
					var filename = fileList[i];
					if (filename.slice(-4) === '.dat'){
						var config = folderObj[filename];
					}else if (filename.slice(-4) === '.csv'){
						var preview = folderObj[filename];
					}
				}	
					
				promise_array.push(getMultiRemote(config));
				promise_array.push(getMultiRemote(preview));
				Promise.all(promise_array).then( values => {
					var config = JSON.parse(values[0]);
					var preview_string = values[1];
					var preview_arr = CSV.parse(preview_string);
					config.fields = preview_arr[0];

					res.send({
						title:'Social Media Past Search Result', 
						ID:req.body.folderURL,
						download:[{name:'CSV format', content:preview}],
						preview:[{name: "Preview the .csv file", content:preview_arr.slice(0,101),dataTable:true}],
						config:config
					});								
					
				});
			}else{
				res.send({ERROR:`Sorry! We cannot find a complete analytic history associated with this ID. You should double checked
				if you have fulfilled all the required  process when carrying out this analysis.`});
			}
		});
	}
			
	else if (arrURL[1] === 'GraphQL' && 
		(arrURL[2] === 'reddit-Search' ||
		arrURL[2] === 'reddit-Post' ||
		arrURL[2] === 'reddit-Historical-Post' )){
		
		var p = list_files(req.body.folderURL);
		p.then(folderObj =>{

			var promise_array = [];	
			var fileList = Object.keys(folderObj);
			
			if(fileList.length >= 2){
				for (var i=0, length=fileList.length; i< length; i++){
					var filename = fileList[i];
					if (filename.slice(-4) === '.dat'){
						var config = folderObj[filename];
					}else if (filename.slice(-4) === '.csv'){
						var preview = folderObj[filename];
					}else if (filename.slice(-4) === '.zip'){
						var comments = folderObj[filename];
					}
				}	
				var download = [{name:'CSV format', content:preview}];
				if (comments !== undefined) download.push({name:'Collection of comments', content: comments})
					
				promise_array.push(getMultiRemote(config));
				promise_array.push(getMultiRemote(preview));
				Promise.all(promise_array).then( values => {
					var config = JSON.parse(values[0]);
					var preview_string = values[1];
					var preview_arr = CSV.parse(preview_string);
					config.fields = preview_arr[0];

					res.send({
						title:'Social Media Past Search Result', 
						expandable:req.body.folderURL,
						ID:req.body.folderURL,
						download:download,
						preview:[{name: "Preview the .csv file", content:preview_arr.slice(0,101),dataTable:true}],
						length:preview_arr.length-1, // display in the expand comments modal
						config:config
					});						
					
				});
				
			}else{
				res.send({ERROR:`Sorry! We cannot find a complete analytic history associated with this ID. You should double checked
				if you have fulfilled all the required  process when carrying out this analysis.`});
			}
		});
				
				
	}

});

router.post('/delete',function(req,res,next){
	
	if(req.body.type === 'purge'){
		// wipe out local directory and remote folders
		var p = [];
		
		deleteLocalFolders('./downloads').then(() =>{
			deleteRemoteFolder(req.body.s3FolderName).then( values => {
				res.send({'data':'Successfully purged!'});
			}).catch( err =>{
				console.log(err);
				res.send({ERROR:err});
			});
		}).catch( err=>{
			console.log(err);
			res.send({ERROR:err});
		});
	}
	
	else if (req.body.type === 'history'){
		var p = deleteRemoteFolder(req.body.folderURL);
		p.then( () =>{
			res.send({'data':'Successfully deleted!'});
		}).catch(err =>{
			res.send({ERROR:err});
		});		
	}
	
});


module.exports = router;