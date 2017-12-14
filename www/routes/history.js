var express = require('express');
var router = express.Router();
var fs = require('fs');
var CSV = require('csv-string');
var path = require('path');
var appPath = path.dirname(__dirname);
var deleteFolderRecursive = require(path.join(appPath,'scripts','helper_func','deleteDir.js'));

var AWS = require('aws-sdk');
AWS.config.update({
	accessKeyId: '***REMOVED***', 
	secretAccessKey: '***REMOVED***' });
var s3 = new AWS.S3();

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
	
	var promise_array = []
	promise_array.push(list_folders('local/ML/classification/'));
	promise_array.push(list_folders('local/NLP/preprocessing/'));
	promise_array.push(list_folders('local/NLP/sentiment/'));
	promise_array.push(list_folders('local/NW/networkx/'));
	promise_array.push(list_folders('local/GraphQL/twitter-Tweet'));
	promise_array.push(list_folders('local/GraphQL/twitter-User'));
	promise_array.push(list_folders('local/GraphQL/twitter-Stream'));
	promise_array.push(list_folders('local/GraphQL/reddit-Search'));
	promise_array.push(list_folders('local/GraphQL/reddit-Post'));
	promise_array.push(list_folders('local/GraphQL/reddit-Comment'));
	promise_array.push(list_folders('local/GraphQL/reddit-Historical-Post'));
	promise_array.push(list_folders('local/GraphQL/reddit-Historical-Comment'));
	
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
	
	var DIR = './downloads/' + req.body.layer1 + '/' + req.body.layer2 +'/' + req.body.historyID;
	
	if (req.body.layer2=== 'preprocessing' && fs.readdirSync(DIR).length === 7){
		
		var div_data = fs.readFileSync(DIR +'/div.dat', 'utf8'); 
		var sentence_array = fs.readFileSync(DIR +'/sentence.csv','utf8').toString().split("\n")
		var new_sentence_array = [];
		for (var i = 0, length= sentence_array.length; i<length; i++){
			new_sentence_array.push([sentence_array[i]]) //add [] to make it comply with google word tree requirement
		}
		
		var most_common_array = fs.readFileSync(DIR +'/frequent-rank.csv').toString().split("\n")[1]
		var most_freq_word = most_common_array.split(",")[0]
		
		var config = JSON.parse(fs.readFileSync(DIR + '/config.dat','utf8'));
		
		if (fs.readdirSync(DIR).indexOf('lemmatized.csv') >-1){
			var processed = 'lemmatized';
		}else if (fs.readdirSync(DIR).indexOf('stemmed.csv') >-1){
			var processed = 'stemmed';
		}else if (fs.readdirSync(DIR).indexOf('lemmatized-stemmed.csv') >-1){
			var processed = 'lemmatized-stemmed';
		}
		
		res.send({
			title:'Natural Language PreProcessing', 
			ID:req.body.historyID,
			img:[{name:'Word Distribution',content:div_data}],
			download:[
				{name:'phrases', content:DIR +'/sentence.csv'},
				{name:'words', content:DIR +'/tokenized.csv'},
				{name:'most common words by order', content:DIR +'/frequent-rank.csv'},
				{name: processed + ' text', content:DIR + '/' + processed + '.csv'},
				{name:'POS tagged text', content:DIR +'/POStagged.csv'}],
			table:{name:'word tree', content:new_sentence_array, root:most_freq_word},
			config:config
		});
		
	}
	else if (req.body.layer2 === 'sentiment' && fs.readdirSync(DIR).length === 6){
		
		var div_data = fs.readFileSync(DIR + '/div_sent.dat', 'utf8'); 
		var preview_string = fs.readFileSync(DIR +'/sentiment.csv', "utf8"); 
		var preview_arr = CSV.parse(preview_string);
		
		var compound = JSON.parse(fs.readFileSync(DIR +'/document.json','utf8'))['compound'];
		var config = JSON.parse(fs.readFileSync(DIR + '/config.dat','utf8'));
		res.send({
					title:'Sentiment Analysis',
					ID:req.body.historyID,
					img:[{name:'Document Sentiment Composition',content:div_data}],
					compound:compound,
					download:[{name:'sentence-level sentiment scores',content:DIR +'/sentiment.csv'},
							{name:'Has negation words?',content:DIR +'/negation.csv'},
							{name:'Has some capital letter?',content:DIR +'/allcap.csv'}],
					preview:[{name:'Preview the sentiment scores for each sentence',content:preview_arr,dataTable:true}],
					config:config
				});
	}
	else if (req.body.layer2 === 'classification'  && fs.readdirSync(DIR).length === 10){
		var div_data0 = fs.readFileSync(DIR +'/div_split.dat', 'utf8');
		var div_data1 = fs.readFileSync(DIR +'/div.dat', 'utf8'); //trailing /r 
		var div_data2 = fs.readFileSync(DIR +'/div_comp.dat', 'utf8'); //trailing /r 
		var preview_string1 = fs.readFileSync(DIR +'/accuracy_score.csv', "utf8"); 
		var preview_arr1 = CSV.parse(preview_string1);
		var preview_string2 = fs.readFileSync(DIR +'/classification_report.csv', "utf8"); 
		var preview_arr2 = CSV.parse(preview_string2);
		var config = JSON.parse(fs.readFileSync(DIR + '/config.dat','utf8'));
		
		var fnames = fs.readdirSync(DIR);
		fnames = fnames.filter(item => item !== 'div.dat' && item !== 'div_comp.dat' && item !== 'config.dat' && item !== 'div_split.dat');
		var downloadFiles = [];
		for (var i=0; i< fnames.length; i++){
			if (fnames[i] === 'classification_pipeline.pickle'){
				downloadFiles.push({'name':'classification model', 'content':DIR + '/' + fnames[i]}); 
			}else{
				var fnameRegex = /(.*).csv/g	
				var display_name = fnameRegex.exec(fnames[i])[1];
				
				if (display_name.slice(0,10) === 'PREDICTED_'){
					var preview_string3 = fs.readFileSync(DIR +'/' + display_name +'.csv', "utf8"); 
					var preview_arr3 = CSV.parse(preview_string3);
				}
				downloadFiles.push({'name':display_name, 'content':DIR + '/' + fnames[i]}); 
			}
		}
		res.send({
				title:'text classification', 
				ID:req.body.historyID,
				img:[{name:'Split the Corpus', content:div_data0},
					{name:'ROC curves for each class',content:div_data1},
					{name:'Count of each class',content:div_data2}],
				download:downloadFiles,
				preview:[{name:'Accuracy score for each fold',content:preview_arr1,dataTable:false},
						{name:'Preview training report',content:preview_arr2,dataTable:false},
							{name:'Predicted results',content:preview_arr3,dataTable:true}],
				config:config
			});
	}
	else if (req.body.layer2 === 'networkx' && fs.readdirSync(DIR).length >=5){
		var fnames = fs.readdirSync(DIR);
		var div_data = fs.readFileSync(DIR + '/div.dat', 'utf8');
		var config = JSON.parse(fs.readFileSync(DIR + '/config.dat','utf8'));
		/*if (fs.existsSync(DIR + '/d3js.json')){
			var d3js_data = JSON.parse(fs.readFileSync(DIR + '/d3js.json','utf8'));
		}else{
			var d3js_data = '';
		}*/
		
		fnames = fnames.filter(item => item !== 'div.dat' && item !== 'config.dat');
		
		var downloadFiles = [];
		for (var i=0; i< fnames.length; i++){
			if (fnames[i] === 'd3js.json'){
				downloadFiles.push({'name':'graph exported in JSON format', 'content':DIR + '/' + fnames[i]}); 
			}else if (fnames[i] === 'network.gml'){
				downloadFiles.push({'name':'graph exported in GML (Gephi) format', 'content':DIR + '/' + fnames[i]}); 
			}else if (fnames[i] === 'network.net'){
				downloadFiles.push({'name':'graph exported in NET (Pajek) format', 'content':DIR + '/' + fnames[i]}); 
			}else{
				var fnameRegex = /(.*).csv/g
				var display_name = fnameRegex.exec(fnames[i])[1];
				downloadFiles.push({'name':display_name, 'content':DIR + '/' + fnames[i]}); 
			}
		}
		
		//console.log(fnames);
		res.send({
			title:'Network Analysis', 
			ID:req.body.historyID,
			img:[{name:'Static Network Visualization',content:div_data}],
			download: downloadFiles,
			preview:[],
			config: config,
		});
	}
	else if ((
				req.body.layer2 === 'twitter-Tweet' ||
				req.body.layer2 === 'twitter-User' ||
				req.body.layer2 === 'twitter-Stream' ||
				req.body.layer2 === 'reddit-Comment' ||
				req.body.layer2 === 'reddit-Historical-Comment') && fs.readdirSync(DIR).length ==2){
		var config = JSON.parse(fs.readFileSync(DIR  + '/' + req.body.historyID + '.dat','utf8'));
		var preview_string = fs.readFileSync(DIR + '/' + req.body.historyID + '.csv', "utf8"); 
		var preview_arr = CSV.parse(preview_string);
		config.fields = preview_arr[0];
		
		res.send({
				title:'Social Media Past Search Result', 
				ID:req.body.historyID,
				download:[
					//{name:'JSON format', content: DIR + '/' + req.body.historyID + '.json'},
					{name:'CSV format', content: DIR + '/' + req.body.historyID + '.csv'}],
				preview:[{name: "Preview the .csv file", content:preview_arr.slice(0,101),dataTable:true}],
				config:config
			});
	}
	else if ((req.body.layer2 === 'reddit-Search' ||
				req.body.layer2 === 'reddit-Post' ||
				req.body.layer2 === 'reddit-Historical-Post') && fs.readdirSync(DIR).length >=2){
		var config = JSON.parse(fs.readFileSync(DIR  + '/' + req.body.historyID + '.dat','utf8'));
		var preview_string = fs.readFileSync(DIR + '/' + req.body.historyID + '.csv', "utf8"); 
		var preview_arr = CSV.parse(preview_string);
		config.fields = preview_arr[0];
		
		download = [{name:'CSV format', content: DIR + '/' + req.body.historyID + '.csv'}]
		if (fs.existsSync(DIR + '/' + req.body.historyID + '-comments.zip')){
			download.push({name:req.body.historyID + '-comments.zip', content: DIR + '/' + req.body.historyID + '-comments.zip'})
		}
		
		res.send({
				title:'Social Media Past Search Result', 
				expandable:req.body.layer2 + '/' + req.body.historyID + '/' + req.body.historyID +'.csv',
				ID:req.body.historyID,
				download:download,
				preview:[{name: "Preview the .csv file", content:preview_arr.slice(0,101),dataTable:true}],
				config:config
			});
	}			
	else{
		res.send({ERROR:`Sorry! We cannot find a complete analytic history associated with this ID. You should double checked
		if you have fulfilled all the required  process when carrying out this analysis.`});
	}

});

router.post('/delete',function(req,res,next){
	console.log(req.body.type);
	
	if (req.body.type === 'analytics'){
		var DIR = './downloads/' + req.body.layer1 + '/' + req.body.layer2 +'/' + req.body.historyID;
		deleteFolderRecursive(DIR);
		res.send({'data':'Successfully deleted!'});
	}
	
	else if (req.body.type === 'graphql'){
		
		var DIR_GraphQL = './downloads/GraphQL/' + req.body.historyID;
		deleteFolderRecursive(DIR_GraphQL);
		res.send({'data':'Successfully deleted!'});
		
	}
	
	else if(req.body.type === 'purge'){
		deleteFolderRecursive('./downloads');
		res.send({'data':'Successfully purged!'});
	}
});



function list_folders(prefix){
		
	return new Promise((resolve,reject) =>{
		s3.listObjects({Bucket:'socialmediamacroscope-smile',Prefix:prefix, Delimiter:'/'},function(err,data){
			if (err) reject(err);
			
			folderObj = {};
			
			var fileList = data.CommonPrefixes;
			if (fileList !== []){
				for (var i=0, length=fileList.length; i< length; i++){
					var folderID = fileList[i].Prefix.split('/')[3];
					folderObj[folderID] = fileList[i].Prefix;
				}
			}
			resolve(folderObj);
		});
	});
		
};

module.exports = router;