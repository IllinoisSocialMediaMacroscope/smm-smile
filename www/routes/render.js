//require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var CSV = require('csv-string');
var path = require('path');
var appPath = path.dirname(__dirname);
var getMultiRemote = require(path.join(appPath,'scripts','helper_func','getRemote.js'));
var list_files = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_files;
var list_folders = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_folders;
var fs = require('fs');

router.post('/render-json', function(req,res,next){
	getMultiRemote(req.body.fileURL).then((preview_string) => {
		if (preview_string === ''){
			res.send({ERROR: 'Nothing to render'});
		}else{
			var preview_json = JSON.parse(preview_string);
			var prefix = Object.keys(preview_json)[0];
			var begin = parseInt(req.body.begin);

			if (begin < 0){
				res.send({ERROR: 'It\'s already the first page!'})
			}else if (begin > preview_json[prefix].length -1){
				res.send({ERROR: 'It\'s already the last page!'})
			}else{
				if (begin + 99 > preview_json[prefix].length -1){
					var end = preview_json[prefix].length -1;
				}else{
					var end = begin + 99;
				}
				
				res.send({preview:preview_json[prefix].slice(begin, end),
							prefix: prefix}); 
			}
		}
	}).catch( err =>{
		console.log(err);
		res.send({ERROR:err});
	});
});

router.post('/render',function(req,res,next){

	if (req.body.prefix !== '' && req.body.prefix !== undefined){
		
		var p = list_files(req.body.prefix);
		p.then((folderObj) =>{
			// folderObj[filename] = fileURL;
			var fileList = Object.keys(folderObj);
			for (var i=0, length=fileList.length; i< length; i++){
				if (fileList[i].slice(-4) === '.csv'){
					var fileURL = folderObj[fileList[i]];
					
					var p2 = getMultiRemote(fileURL);
					p2.then((preview_string) => {
						if (preview_string === ''){
						res.send({ERROR: 'This dataset you selected is empty, please select another one!'});
						}else{
							var preview_arr = CSV.parse(preview_string);
							res.send({preview:preview_arr}); 
						}
					});
					
				}
			}
			
		}).catch( (err) => {
			res.send({ERROR:err});
		});
	}else{
		res.send();
	}
});

router.post('/list',function(req,res,next){

	var directory = {};
							
	var promise_array = [];
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/twitter-Tweet/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/twitter-User/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/twitter-Stream/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/reddit-Search/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/reddit-Post/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/reddit-Comment/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/reddit-Historical-Post/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/reddit-Historical-Comment/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/crimson-Hexagon/'));
	Promise.all(promise_array).then( values => {
		
		directory['twitter-Tweet'] = values[0];
		directory['twitter-User'] = values[1];
		directory['twitter-Stream'] = values[2];
		directory['reddit-Search'] = values[3];
		directory['reddit-Post'] = values[4];
		directory['reddit-Comment'] = values[5];
		directory['reddit-Historical-Post'] = values[6];
		directory['reddit-Historical-Comment'] = values[7];
		directory['crimson-Hexagon'] = values[8];

		res.send(directory);
	}).catch(err =>{
		res.send({ERROR:err});
	});
	
});

router.post('/list-all',function(req,res,next){

	var directory = {
						"GraphQL":
							{"twitter-Tweet":{},
							"twitter-User":{},
							"twitter-Stream":{},
							"reddit-Search":{},
							"reddit-Comment":{},
							"reddit-Post":{},
							"reddit-Historical-Post":{},
							"reddit-Historical-Comment":{},
							"crimson-Hexagon":{},
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
	promise_array.push(list_folders(req.body.s3FolderName + '/ML/classification/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/NLP/preprocessing/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/NLP/sentiment/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/NW/networkx/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/twitter-Tweet/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/twitter-User/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/twitter-Stream/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/reddit-Search/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/reddit-Post/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/reddit-Comment/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/reddit-Historical-Post/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/reddit-Historical-Comment/'));
	promise_array.push(list_folders(req.body.s3FolderName + '/GraphQL/crimson-Hexagon/'));

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
		directory['GraphQL']['crimson-Hexagon'] = values[12];

		res.send(directory);
		
	}).catch( (err) => { 
	
		res.send({ERROR:err}); 
		
	});
	
});

router.post('/tag',function(req,res,next){
	// update the map
	if (req.body.tagName !== '' && req.body.tagName !== undefined){
		if (fs.existsSync('./map.json')){
			var tagIdMap = JSON.parse(fs.readFileSync('./map.json'));
			tagIdMap[req.body.jobId] = req.body.tagName;
		}else{
			tagIdMap = {};
			tagIdMap[req.body.jobId] = req.body.tagName;
		}
	
		// save it to file
		fs.writeFileSync('./map.json',JSON.stringify(tagIdMap));
		
	}
	
	res.send('done!');
	
});


module.exports = router;
