require('dotenv').config();
var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var fs = require('fs');
var jsonexport = require('jsonexport');
var path = require('path');
var appPath = path.dirname(__dirname);
var deleteFolderRecursive = require(path.join(appPath,'scripts','helper_func','deleteDir.js'));
var uploadToS3 = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).uploadToS3;
var list_folders = require(path.join(appPath,'scripts','helper_func','s3Helper.js')).list_folders;

router.get('/query',function(req,res,next){

	// check if all the sessions have token, in case the server stops in the middle
	if (req.session.twt_access_token_key === undefined || req.session.twt_access_token_secret === undefined){
		res.cookie('twitter-success','false',{maxAge:365 * 24 * 60 * 60 * 1000, httpOnly:false});	
	}
	
	if (req.session.rd_access_token === undefined){
		res.cookie('reddit-success','false',{maxAge:365 * 24 * 60 * 60 * 1000, httpOnly:false});	
	}
	
	res.render('search/query',{	parent:'/',	error:req.query.error});
	
});


router.post('/query',function(req,res,next){
	
	var dir_downloads = './downloads';	
	if (!fs.existsSync(dir_downloads)){
		fs.mkdirSync(dir_downloads);
	}
	
	var dir_downloads_graphql = './downloads/GraphQL';
	if (!fs.existsSync(dir_downloads_graphql)){
		fs.mkdirSync(dir_downloads_graphql);
	}
	if (!fs.existsSync(dir_downloads_graphql + '/' +  req.body.prefix)){
		fs.mkdirSync(dir_downloads_graphql + '/' + req.body.prefix);
	}
	
	if (fs.existsSync(dir_downloads_graphql + '/' +  req.body.prefix)){
		var directory = fs.readdirSync(dir_downloads_graphql + '/' + req.body.prefix);
		
		checkExist(req.body.s3FolderName + '/GraphQL/'+req.body.prefix +'/', req.body.filename).then((value) =>{
			if (value){
					
				var headers = {
								'Accept': 'application/json',
								'Content-Type':'application/json',
								'redditaccesstoken':req.session.rd_access_token,
								'twtaccesstokenkey':req.session.twt_access_token_key,
								'twtaccesstokensecret':req.session.twt_access_token_secret,
							}
				
				p_array_2 = [];
				
				// if twitter queryUser or elastic search
				if (req.body.prefix === 'twitter-User' || req.body.prefix === 'twitter-Stream'){
					for (var i=0; i<req.body.pages; i++){
						p_array_2.push(gatherMultiPost(req.body.query, headers, i+1));
					}
				}
				else if (req.body.prefix === 'twitter-Tweet'){
					// tweet timeline pagination is different, can't figure out a good way to do pagination here
					// TODO
					p_array_2.push(gatherMultiPost(req.body.query, headers, -999));
				}
				else if (req.body.prefix === 'reddit-Search'){
					p_array_2.push(gatherMultiPost(req.body.query, headers, -999));
				}
				else if (req.body.prefix === 'reddit-Post'){
					p_array_2.push(gatherMultiPost(req.body.query, headers, -999));
				}
				else if (req.body.prefix === 'reddit-Comment'){
					p_array_2.push(gatherMultiPost(req.body.query, headers, -999));
				}else if (req.body.prefix === 'reddit-Historical-Post'){
					p_array_2.push(gatherMultiPost(req.body.query, headers, -999));
				}else if (req.body.prefix === 'reddit-Historical-Comment'){
					p_array_2.push(gatherMultiPost(req.body.query, headers, -999));
				}
				
				
				Promise.all(p_array_2).then( values => {
									
					// piece the json together here
					var key1 = Object.keys(values[0])[0];
					var key2 = Object.keys(values[0][key1])[0];
					var key3 = Object.keys(values[0][key1][key2])[0];
			
					responseObj = mergeJSON(values,[key1,key2,key3]);
					
					if ("errors" in responseObj){
						res.send({ERROR:responseObj['errors'][0]['message']});
					}else{		
						// ------------------------------------save csv file---------------------------------------------------------		
						if (responseObj[key1][key2][key3].length > 0 
								&& responseObj[key1][key2][key3] !== 'null'
								&& responseObj[key1][key2][key3] !== undefined ){
							
							
							// if no such folder, create that folder
							var directory = dir_downloads_graphql + '/' + req.body.prefix + '/' + req.body.filename +'/';
							if (!fs.existsSync(directory)){
								fs.mkdirSync(directory);
							}
							
		
							// save query parameters to it so history page can use it! Synchronous method
							var config = req.body.filename + '.dat';
							params = JSON.parse(req.body.params);
							if (req.body.pages !== '-999') params['pages:'] = req.body.pages;
							if (params['fields'] === "") params['fields'] === "DEFAULT";

							fs.writeFileSync(directory +  config, JSON.stringify(params), 'utf8');
								
							// save CSV; Async
							var processed = req.body.filename + '.csv';	
							var promise_csv = new Promise((resolve,reject) =>{	
								jsonexport(responseObj[key1][key2][key3], {fillGaps:true,undefinedString:'NaN'},function(err,csv){
									if (err) reject(err);
									if (csv !== ''){
										fs.writeFile(directory +  processed,csv,'utf8',function(err){ 
												if (err){
													reject(err);
												}else{
													resolve();
												}
											});
									}	
								});
							});
							
							promise_csv.then(() =>{
								
								var promise_arr = [];
								promise_arr.push(uploadToS3(directory+processed, req.body.s3FolderName + '/GraphQL/'+req.body.prefix +'/'+req.body.filename +'/'+processed));
								promise_arr.push(uploadToS3(directory+config, req.body.s3FolderName + '/GraphQL/'+req.body.prefix +'/'+req.body.filename +'/'+config));
								Promise.all(promise_arr).then((URLs) => {
									// success!!
									var rendering = responseObj[key1][key2][key3].slice(0,99);
									deleteFolderRecursive(directory.slice(0,-1)); // no "/' in the end of the string
									res.send({fname:processed,URL: URLs[0] ,rendering:rendering});
								
								}).catch(err =>{ 
									console.log(err);
									res.send({ERROR:JSON.stringify(err)});
								});
								
							}).catch(err =>{
								console.log(err);
								res.send({ERROR:JSON.stringify(err)});
							});
								
						}
						else{
							res.send({ERROR:"Sorry, we couldn't find results that matches your query..."});
						}					
					}
					
				}).catch( (error) =>{
					res.send({ERROR:JSON.stringify(error)});
				})
			}
			else{
				res.send({ERROR:'This filename ' + req.body.filename + ' already exist in your directory. Please rename it to something else!'});
			}	
		});	
		
	}
			
});



/****************************************************************** helper *****************************************************************************************/		
function checkExist(remotePrefix, localFolderName){
	var p = list_folders(remotePrefix);
	return p.then(folderObj =>{
		var subFolders = Object.keys(folderObj);
		for (var i=0, length=subFolders.length; i< length; i++){
			if (subFolders[i].toLowerCase() === localFolderName.toLowerCase()){
				return false;
			}
		}
		return true;
	});
}
		
		
function gatherMultiPost(query,headers,pageNum){
	// user regex to add a page:pageNum in the query here
	if (pageNum !== -999){
		query = query.replace(/(\){)/g, ",pageNum:" + pageNum + "$1");
	}
	return new Promise((resolve,reject) =>{
		fetch('http://localhost:5050/graphql', {method:'POST',
												headers:headers,
												body:JSON.stringify({"query":query })
			}).then(function(response){
				return response.text();
			}).then(function(responseBody){
				var responseObj = JSON.parse(responseBody);
				resolve(responseObj);				
			}).catch((error) => {
				reject(error);
			});
	});
};

function mergeJSON(values,keys){
	/* {
		data{
			twitter{
				...
			}
		}
	}*/
	var newJSON = {};
	
	newJSON[keys[0]] = {};
	newJSON[keys[0]][keys[1]] = {};
	newJSON[keys[0]][keys[1]][keys[2]] = [];
	
	for (var i=0; i<values.length; i++){
		newJSON[keys[0]][keys[1]][keys[2]] = newJSON[keys[0]][keys[1]][keys[2]].concat(values[i][keys[0]][keys[1]][keys[2]]);
	}
	
	return newJSON;
};

module.exports = router;
