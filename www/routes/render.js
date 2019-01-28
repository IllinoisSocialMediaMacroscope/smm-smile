//require('dotenv').config();
var express = require('express');
var router = express.Router();
var CSV = require('csv-string');
var path = require('path');
var appPath = path.dirname(__dirname);
var columnHeadersPath = path.join(appPath,'columnHeaders.json');
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
			var fileList = Object.keys(folderObj);
			for (var i=0, length=fileList.length; i< length; i++){
				if (fileList[i].slice(-4) === '.csv'){
					var fileURL = folderObj[fileList[i]];
					
					var p2 = getMultiRemote(fileURL);
					p2.then((preview_string) => {
						if (preview_string === ''){
						res.send({ERROR: 'This dataset you selected is empty, please select another one!'});
						}else{

                            if (fs.existsSync(columnHeadersPath)){
                                var columnHeaders = JSON.parse(fs.readFileSync(columnHeadersPath));
                            }
                            else{
                            	res.send({ERROR: "Cannot load preview due to missing the columnHeaders.json file."})
                            }

                            // add custom setting headers
                            var customColumnHeadersPath = path.join(smileHomePath, 'customColumnHeaders.json');
                            if (fs.existsSync(customColumnHeadersPath)) {
                                var customColumnHeaders = JSON.parse(fs.readFileSync(customColumnHeadersPath));
                                for (var key in customColumnHeaders){
                                    for (i=0; i<customColumnHeaders[key].length; i++){
                                        if (columnHeaders[key].indexOf(customColumnHeaders[key][i]) < 0) {
                                            columnHeaders[key].push(customColumnHeaders[key][i]);
                                        }
                                    }
                                }
                            }

							var preview_arr = CSV.parse(preview_string);
							res.send({preview:preview_arr, columnHeaders:columnHeaders});
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
	promise_array.push(list_folders(s3FolderName + '/GraphQL/twitter-Tweet/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/twitter-User/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/twitter-Stream/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/reddit-Search/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/reddit-Post/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/reddit-Comment/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/reddit-Historical-Post/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/reddit-Historical-Comment/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/crimson-Hexagon/'));
    promise_array.push(list_folders(s3FolderName + '/GraphQL/userspec-Others/'));
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
		directory['userspec-Others'] = values[9];

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
							"userspec-Others":{}
						},
						"ML":
						{
							"classification":{}
						},
						"NLP":
							{"preprocessing":{},
							"sentiment":{},
							"autophrase":{}
							},
						"NW":{"networkx":{}},
					}
	
	var promise_array = [];
	// session id instead of local here!!
	promise_array.push(list_folders(s3FolderName + '/ML/classification/'));
	promise_array.push(list_folders(s3FolderName + '/NLP/preprocessing/'));
	promise_array.push(list_folders(s3FolderName + '/NLP/autophrase/'));
	promise_array.push(list_folders(s3FolderName + '/NLP/sentiment/'));
	promise_array.push(list_folders(s3FolderName + '/NW/networkx/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/twitter-Tweet/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/twitter-User/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/twitter-Stream/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/reddit-Search/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/reddit-Post/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/reddit-Comment/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/reddit-Historical-Post/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/reddit-Historical-Comment/'));
	promise_array.push(list_folders(s3FolderName + '/GraphQL/crimson-Hexagon/'));
    promise_array.push(list_folders(s3FolderName + '/GraphQL/userspec-Others/'));

	Promise.all(promise_array).then( values => {
		directory['ML']['classification'] = values[0];
		directory['NLP']['preprocessing'] = values[1];
		directory['NLP']['autophrase'] = values[2];
		directory['NLP']['sentiment'] = values[3];
		directory['NW']['networkx'] = values[4];
		directory['GraphQL']['twitter-Tweet'] = values[5];
		directory['GraphQL']['twitter-User'] = values[6];
		directory['GraphQL']['twitter-Stream'] = values[7];
		directory['GraphQL']['reddit-Search'] = values[8];
		directory['GraphQL']['reddit-Post'] = values[9];
		directory['GraphQL']['reddit-Comment'] = values[10];
		directory['GraphQL']['reddit-Historical-Post'] = values[11];
		directory['GraphQL']['reddit-Historical-Comment'] = values[12];
		directory['GraphQL']['crimson-Hexagon'] = values[13];
		directory['GraphQL']['userspec-Others'] = values[14];
		res.send(directory);
		
	}).catch( (err) => { 
	
		res.send({ERROR:err}); 
		
	});
	
});

router.post('/add-columnHead', function(req,res,next){
    // allow user to add custom column header name to the list
	// used when perform analyses on dataset
	// write to user's home direction under SMILE folder

	var data = req.body;
	if (data.customColumnHeaders !== []
		&& data.customColumnHeaders !== undefined
		&& data.analyses !== []
		&& data.analyses !== undefined
	){
		// if smile home folder doesn't exist, create one
		if (!fs.existsSync(smileHomePath)){
            fs.mkdirSync(smileHomePath);
        }

        // write user specific column header to customColumnHeaders.json file
        var customColumnHeadersPath = path.join(smileHomePath, 'customColumnHeaders.json');
        if (fs.existsSync(customColumnHeadersPath)){
            var customColumnHeaders = JSON.parse(fs.readFileSync(customColumnHeadersPath));
            for (i=0; i<data.analyses.length; i++){
                for (j=0; j<data.customColumnHeaders.length; j++){
                    if (customColumnHeaders[data.analyses[i]].indexOf(data.customColumnHeaders[j]) < 0){
                        customColumnHeaders[data.analyses[i]].push(data.customColumnHeaders[j]);
                    }
                }
            }
        }else{
            var customColumnHeaders = {};
            for (i=0; i<data.analyses.length; i++){
            	customColumnHeaders[data.analyses[i]] = [];
                for (j=0; j<data.customColumnHeaders.length; j++){
                	customColumnHeaders[data.analyses[i]].push(data.customColumnHeaders[j]);
                }
            }
        }

        // save it to file
        fs.writeFileSync(customColumnHeadersPath, JSON.stringify(customColumnHeaders, null, 4));
        res.send({message: 'done!'});
    }
});

router.get('/list-columnHead', function(req, res, next){
    var columnHeaders = JSON.parse(fs.readFileSync(columnHeadersPath));

    var customColumnHeadersPath = path.join(smileHomePath, 'customColumnHeaders.json');
    if (fs.existsSync(customColumnHeadersPath)) {
        var customColumnHeaders = JSON.parse(fs.readFileSync(customColumnHeadersPath));
        for (var key in customColumnHeaders){
            for (i=0; i<customColumnHeaders[key].length; i++){
        		if (columnHeaders[key].indexOf(customColumnHeaders[key][i]) < 0) {
                    columnHeaders[key].push(customColumnHeaders[key][i]);
                }
			}
		}
    }

    res.send(columnHeaders);
});

module.exports = router;
