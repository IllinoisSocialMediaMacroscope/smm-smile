var Promise = require('bluebird');
var fetch = require('node-fetch');
var appendQuery = require('append-query');

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
				
			// case 'pushshiftPost':
			//
			// 	//construct this query and delete other args
			// 	if ('subreddit' in args){
			// 		args['q'] += ' AND subreddit:' + args['subreddit'];
			// 		delete args['subreddit'];
			// 	}
			// 	if ('author' in args){
			// 		args['q'] += ' AND author:' + args['author'];
			// 		delete args['author'];
			// 	}
			// 	if ('before' in args && 'after' in args){
			// 		args['q'] += ' AND created_utc:<=' + args['before'];
			// 		args['q'] += ' AND created_utc:>=' + args['after'];
			// 		delete args['before'];
			// 		delete args['after'];
			// 	}
			//
			// 	console.log(args.q);
			// 	var endpoint = appendQuery('https://elastic.pushshift.io/rs/submissions/_search/',args);
			// 	fetch(endpoint).then((res) =>{
			// 		return res.json();
			// 	}).then(function(json){
			// 		resolve(json.hits.hits);
			// 	}).catch((err) =>{
			// 		console.log(err);
			// 		reject(err);
			// 	});
			// 	break;
				
			
			default:
				console.log('sorry we can\'t find matching resolve type:' + resolveName);
				resolve(null);
		}
	});
}

module.exports = pushshiftAPI;
