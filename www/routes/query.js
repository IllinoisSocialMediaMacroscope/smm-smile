require('dotenv').config();
var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var fs = require('fs');
var jsonexport = require('jsonexport');
const getSize = require('get-folder-size');

router.get('/query',function(req,res,next){
		
	var success = [];
	if (req.session.twt_access_token_key !== undefined && req.session.twt_access_token_secret !== undefined){
		success.push('twitter');
	}
	
	if (req.session.rd_access_token !== undefined){
		success.push('reddit');
	}
	// add other social media following this context upppp 
	if (req.session.es_access_token !== undefined && req.session.es_access_token_secret !== undefined){
		success.push('es');
	}
	
	if (req.query !== undefined && 'error' in req.query){
		res.render('search/query',{error:req.query.error,success:success,parent:'/'});
	}else{
		res.render('search/query',{success:success,
										parent:'/',
										error:req.query.error});
	}
	
});


router.post('/query',function(req,res,next){
	
	var dir_downloads = './downloads';	
	if (!fs.existsSync(dir_downloads)){
		fs.mkdirSync(dir_downloads);
	}
	
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
					var dir_downloads_graphql = './downloads/GraphQL';
					if (!fs.existsSync(dir_downloads_graphql)){
						fs.mkdirSync(dir_downloads_graphql);
					}
					if (!fs.existsSync(dir_downloads_graphql + '/' +  req.body.prefix)){
						fs.mkdirSync(dir_downloads_graphql + '/' + req.body.prefix);
					}
					
					console.log(fs.existsSync(dir_downloads_graphql + '/' +  req.body.prefix));
					
					if (fs.existsSync(dir_downloads_graphql + '/' +  req.body.prefix)){
						// make sure files that already exist in the directory wont be allowed
						var p_array = [];
						var directory = fs.readdirSync(dir_downloads_graphql + '/' + req.body.prefix);
						
						for (var i=0; i< directory.length; i++){
							p_array.push(checkExist(directory[i], req.body.filename));
						}
						
						Promise.all(p_array).then(() =>{
							console.log('this filename hasn\'t been used!');
							
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
								
									var response = saveFile(dir_downloads_graphql,responseObj, req.body.params,req.body.pages, req.body.prefix, req.body.filename,[key1,key2,key3]);	
									res.send(response);
								}
								
							}).catch( (error) =>{
								res.send({ERROR:error});
							})
							
						}).catch(() => {
							res.send({ERROR:'This filename ' + req.body.filename + ' already exist in your directory. Please rename it to something else!'});
						});
					}
				
			}
		}
	});
	
	
		
});



/****************************************************************** helper *****************************************************************************************/
function saveFile(dir_downloads_graphql, responseObj,params,pages,prefix, filename,keys){
	// ------------------------------------save csv file---------------------------------------------------------		
	if (responseObj[keys[0]][keys[1]][keys[2]].length > 0 
			&& responseObj[keys[0]][keys[1]][keys[2]] !== 'null'
			&& responseObj[keys[0]][keys[1]][keys[2]] !== undefined ){
		
		var directory = dir_downloads_graphql + '/' + prefix + '/' + filename +'/';
		fs.mkdir(directory, function(err){
			if (err){
				return {ERROR:err};
			}	
		});
		
		// save CSV
		var processed = filename + '.csv';		
		jsonexport(responseObj[keys[0]][keys[1]][keys[2]], {fillGaps:true,undefinedString:'NaN'},function(err,csv){
			if (err){
					return {ERROR:err};
				}
			if (csv != ''){
				fs.writeFile(directory +  processed, 
					csv,'utf8',function(err){ 
						if (err){
							return {ERROR:err};
						}	
					});
			}
		});
		
		// save query parameters to it so history page can use it!
		var config = filename + '.dat';
		
		// add page information back at server side
		params = JSON.parse(params);
		if (pages !== '-999'){
			params['pages:'] = pages;
		}
		if (params['fields'] === ""){
			params['fields'] === "DEFAULT"
		}
		fs.writeFile(directory +  config, JSON.stringify(params), 'utf8',function(err){
			if (err){
					return {ERROR:err};
				}
		});	
		
		var rendering = responseObj[keys[0]][keys[1]][keys[2]];
		
	}
	else{
		var processed = '';
		var raw = '';
		var config = '';
		
		return {ERROR:"Sorry, we couldn't find results that matches your query..."};
	}
	
	return {
				fname:processed,
				URL: directory + processed,
				rendering:rendering.slice(0,99)
	};
}
					
function checkExist(directory_f, filename){
	
	return new Promise((resolve,reject) =>{
		if (directory_f === filename){
			console.log('has been used!!');
			reject();
		}else{
			resolve(directory_f);
		}
	});
	
};

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
