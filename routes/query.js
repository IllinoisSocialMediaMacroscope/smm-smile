require('dotenv').config();
var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var fs = require('fs');
var jsonexport = require('jsonexport');
var zip = require('adm-zip');

router.get('/query',function(req,res,next){
	
	if (req.session.twt_access_token_key !== undefined 
		&& req.session.twt_access_token_secret !== undefined
		//&& req.session.rd_access_token !== undefined
		//&& req.session.rd_refresh_token !== undefined
		&& req.session.es_access_token !== undefined
		&& req.session.es_access_token_secret !== undefined
		){
		res.render('search/query',{parent:'/'});
		
	}else{
		var success = [];
		if (req.session.twt_access_token_key !== undefined && req.session.twt_access_token_secret !== undefined){
			success.push('twitter');
		}
		
		//if (req.session.rd_access_token !== undefined && req.session.rd_refresh_token !== undefined){
		//	success.push('reddit');
		//}
		// add other social media following this context upppp 
		if (req.session.es_access_token !== undefined && req.session.es_access_token_secret !== undefined){
			success.push('es');
		}
		
		if (req.query !== undefined && 'error' in req.query){
			res.render('search/authorize',{error:req.query.error,success:success,parent:'/'});
		}else{
			res.render('search/authorize',{success:success,parent:'/'});
		}
	}
});


router.post('/query',function(req,res,next){
	
	// make directory downloads/GraphQL before save things to it!
	if (!fs.existsSync(process.env.ROOTDIR + process.env.DOWNLOAD)){
		fs.mkdirSync(process.env.ROOTDIR + process.env.DOWNLOAD);
	}	
	if (!fs.existsSync(process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL)){
		fs.mkdirSync(process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL);
	}		
	
	// make sure files that already exist in the directory wont be allowed
	var p_array = [];
	var directory = fs.readdirSync(process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL);
	for (var i=0; i< directory.length; i++){
		p_array.push(checkExist(directory[i], req.body.filename + '.json'));
	}
	
	Promise.all(p_array).then(() =>{
		console.log('this filename hasn\'t been used!');
		
		var headers = {
						'Accept': 'application/json',
						'Content-Type':'application/json',
						//'redditaccesstoken':req.session.rd_access_token,
						//'redditrefreshtoken':req.session.rd_refresh_token,
						'twtaccesstokenkey':req.session.twt_access_token_key,
						'twtaccesstokensecret':req.session.twt_access_token_secret,
						'esaccesstoken':req.session.es_access_token,
						'esaccesstokensecret':req.session.es_access_token_secret
					}
					
		p_array_2 = [];
		
		// if twitter queryUser or elastic search
		if (req.body.filename.substr(0,18) === 'twitter-queryUser-' || req.body.filename.substr(0,18) === 'twitter-streaming-'){
			for (var i=0; i<req.body.pages; i++){
				p_array_2.push(gatherMultiPost(req.body.query, headers, i+1));
			}
		}
		else if (req.body.filename.substr(0,19) === 'twitter-queryTweet-'){
			// tweet timeline pagination is different, can't figure out a good way to do pagination here
			// TODO
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
			
				var response = saveFile(responseObj, req.body.params,req.body.filename,[key1,key2,key3]);	
				res.send(response);
			}
			
		}).catch( (error) =>{
			res.send({ERROR:error});
		})
		
	}).catch(() => {
		res.send({ERROR:'This file ' + req.body.filename + ' already exist in your directory! Please rename it to something else'});
	});
	
});



/****************************************************************** helper *****************************************************************************************/
function saveFile(responseObj,params,filename,keys){
	// ------------------------------------save csv file---------------------------------------------------------		
	if (responseObj[keys[0]][keys[1]][keys[2]].length > 0 && 'replies' in responseObj[keys[0]][keys[1]][keys[2]][0]){
		// create directory
		var dir = process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL + '/'+   req.body.filename + '/'
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, 0744);
			}
		//save zip of CSV	
		var processed = filename + '-replies.zip';
		var zipper = new zip();
		for (var i=0, length= responseObj[keys[0]][keys[1]][keys[2]].length; i<length; i++){
			jsonexport(responseObj[keys[0]][keys[1]][keys[2]][i].replies, {fillGaps:true,undefinedString:'NaN'},function(err,csv){
				if (err){
					return {ERROR:err};
				}
				if (csv !== ''){ // if the file has content
					fs.writeFileSync(dir + responseObj[keys[0]][keys[1]][keys[2]][i].id + '.csv', 
							csv,'utf8',function(err){ 
								if (err){
									return {ERROR:err};
								}	
						}); //save each post's reply in a seperate CSV file, and name it after the id
						
					zipper.addLocalFile(dir + responseObj[keys[0]][keys[1]][keys[2]][i].id + '.csv');
				}
			});
		}
		zipper.writeZip(process.env.ROOTDIR + process.env.DOWNLOAD_GRAPHQL+ '/'+  processed);	
		
		// save json
		var raw = filename + '.json';
		fs.writeFile(process.env.ROOTDIR +process.env.DOWNLOAD_GRAPHQL + '/' +  raw, JSON.stringify(responseObj,null,4),'utf8',function(err){
			if (err){
					return {ERROR:err};
				}
		});
		
		// save query parameters to it so history page can use it!
		var config = filename + '.dat';
		fs.writeFile(process.env.ROOTDIR +process.env.DOWNLOAD_GRAPHQL + '/'+  config, params,'utf8',function(err){
			if (err){
					return {ERROR:err};
				}
		});	
	}
	else if (responseObj[keys[0]][keys[1]][keys[2]].length > 0){
		// save CSV
		var processed = filename + '.csv';
		jsonexport(responseObj[keys[0]][keys[1]][keys[2]], {fillGaps:true,undefinedString:'NaN'},function(err,csv){
			if (err){
					return {ERROR:err};
				}
			if (csv != ''){
				fs.writeFile(process.env.ROOTDIR +process.env.DOWNLOAD_GRAPHQL + '/' + processed, 
					csv,'utf8',function(err){ 
						if (err){
							return {ERROR:err};
						}	
					});
			}
		});
		
		// save json
		var raw = filename + '.json';
		fs.writeFile(process.env.ROOTDIR +process.env.DOWNLOAD_GRAPHQL + '/' +  raw, JSON.stringify(responseObj,null,4),'utf8',function(err){
			if (err){
					return {ERROR:err};
				}
		});
		
		// save query parameters to it so history page can use it!
		var config = filename + '.dat';
		fs.writeFile(process.env.ROOTDIR +process.env.DOWNLOAD_GRAPHQL + '/'+  config, params, 'utf8',function(err){
			if (err){
					return {ERROR:err};
				}
		});	
		
	}
	else{
		var processed = '';
		var raw = '';
		var config = '';
		
		return {ERROR:"Sorry, we couldn't find results that matches your query..."};
	}
	
	return {
				fname:[raw,processed],
				URL: [process.env.ROOTDIR +process.env.DOWNLOAD_GRAPHQL+ '/'+ raw, process.env.ROOTDIR +process.env.DOWNLOAD_GRAPHQL+ '/'+ processed]
	};
}
					
function mergeJSON(arr) {
    return _.chain(arr).groupBy('name').mapValues(function (v) {
        return _.chain(v).pluck('value').flattenDeep();
    }).value();
}

function checkExist(directory_f, filename){
	
	return new Promise((resolve,reject) =>{
		if (directory_f === filename){
			//console.log(directory_f);
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