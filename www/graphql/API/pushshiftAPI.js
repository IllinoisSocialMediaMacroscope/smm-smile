var Promise = require('bluebird');
var fetch = require('node-fetch');
var appendQuery = require('append-query')

function pushshiftAPI(tokens,resolveName, id, args){
	
	return new Promise((resolve,reject) =>{
		switch(resolveName){
			case 'pushshiftComment': 
				if (args['q'] === 'ALL'){
						args['q'] = '';
					}
				var endpoint = appendQuery('https://api.pushshift.io/reddit/search/comment/',args);
				fetch(endpoint).then((res) =>{
					return res.json();
				}).then(function(json){
					resolve(json.data);
				}).catch((err) =>{
					console.log(err);
					reject(err);
				});
				break;
				
			case 'pushshiftPost': 
				if (args['q'] === 'ALL'){
						args['q'] = '';
					}
				var endpoint = appendQuery('https://api.pushshift.io/reddit/search/submission/',args);
				fetch(endpoint).then((res) =>{
					return res.json();
				}).then(function(json){
					resolve(json.data);
				}).catch((err) =>{
					console.log(err);
					reject(err);
				});
				break;
				
			
			default:
				console.log('sorry we can\'t find matching resolve type:' + resolveName);
				resolve(null);
		}
	});
}

module.exports = pushshiftAPI;