var Promise = require('bluebird');
var fetch = require('node-fetch');
var appendQuery = require('append-query')

function redditAPI(tokens,resolveName, id, args){
	
	const snoowrap = require('snoowrap');
	const r = new snoowrap({
			userAgent: 	'social monitoring research',
			accessToken: tokens.redditaccesstoken
	});
	
	r.config({requestDelay:1000});
	
	return new Promise((resolve,reject) =>{
		switch(resolveName){
			case 'search':
				//args['limit'] = args['count'];
				r.search(args).then((listing) =>  {
						
						//console.log(listing.length);
						listing.fetchAll().then(extendedListing => {
							resolve(extendedListing);					
						});
						
					})
					.catch((err) =>{
						console.log(err);
						reject(err)
					})
				break;
				
			case 'getCompleteReplies':
				r.getSubmission(id).expandReplies({options:{limit:Infinity,depth:Infinity}}).then(data =>  {
						agg_comments = [];
						for (var i = 0, length=data.comments.length; i< length; i++){
							commentTreeFlaten(data.comments[i]);
						}
						resolve(agg_comments);
					}).catch((err) => { console.log(err); resolve([]);});
				break;
				
			case 'searchSubreddits':
				args['limit'] = 1000;
				r.searchSubreddits(args).then((listing) =>  {
				listing.fetchAll().then((data) =>{
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
			
			case 'getNewComments':
				if (args['subredditName'] === 'ALL'){
					args['subredditName'] = '';
				}
				r.getSubreddit(args['subredditName']).getNewComments({limit:1}).then((listing) =>  {
					listing.fetchMore({amount:args['extra'],skipReplies:false,append:true}).then((data) => {
						console.log(data.length);
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;	
			
			case 'getNew':
				if (args['subredditName'] === 'ALL'){
					args['subredditName'] = '';
				}
				r.getSubreddit(args['subredditName']).getNew({limit:1}).then((listing) =>  {
					listing.fetchMore({amount:args['extra'],skipReplies:false,append:true}).then((data) => {
						console.log(data.length);
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
			
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
				
			//---------------------------------------------------------------------
			case 'searchSubredditNames':
				r.searchSubredditNames(args).then((data) =>{
					resolve(data);
				})
				.catch((err) =>{
					reject(err)
				});
				break;
				
			case 'searchSubredditTopics':
				args['limit'] = 1000;
				r.searchSubredditTopics(args).then((data) =>{
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					});
				break;
				
			case 'getPopularSubreddits':
				r.getPopularSubreddits(args).then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
			
			case 'getNewSubreddits':
				r.getNewSubreddits(args).then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
				
			case 'getGoldSubreddits':
				r.getGoldSubreddits(args).then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
				
			case 'getDefaultSubreddits':
				r.getDefaultSubreddits(args).then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
				
			case 'getHot':
				r.getHot(args).then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
			
						
			case 'getTop':
				r.getTop(args).then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
				
			case 'getControversial':
				r.getControversial(args).then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
				
			case 'getRising':
				r.getRising(args).then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
				
				
			case 'trophy':
				r.getUser(id).getTrophies().then((data) => {
					resolve(data.trophies);
				})
				.catch((err) =>{
					reject(err)
				});
				break;
			
			case 'overview':
				r.getUser(id).getOverview().then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
			
			case 'submission':
				r.getUser(id).getSubmissions().then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
				
			case 'comment':
				r.getUser(id).getComments().then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
				
			case 'upvote':
				r.getUser(id).getUpvotedContent().then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						//console.log(data);
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
				
			case 'downvote':
				r.getUser(id).getDownvotedContent().then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				})
				.catch((err) =>{
					reject(err);
				});
				break;
				
			case 'expansion':
				agg_comments = [];
				r.getSubmission(id).expandReplies({options:{limit:Infinity,depth:Infinity}}).then(data =>  {
						
					//console.log(data.comments.length);
					for (var i = 0, length=data.comments.length; i< length; i++){
						commentTreeFlaten(data.comments[i]);
					}
					resolve(agg_comments);
						
				})
				.catch((err) =>{
					reject(err);
				});
				break;	
				
			/*case 'getUserFlairTemplates':
				r.getSubreddit(id).getUserFlairTemplates().then((data) => {
						//console.log(data);
						resolve(data);
				});
				break;
				
			case 'subreddit_hot':
				r.getSubreddit(id).getHot().then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						//console.log(data);
						resolve(data);
					})
				});
				break;
				
			case 'subreddit_new':
				r.getSubreddit(id).getNew().then((listing) =>  {
					listing.fetchMore({amount:args['extra']}).then((data) => {
						//console.log(data);
						resolve(data);
					})
				});
				break;
			
			case 'comment':
				r.getUser(id).getComments().then((listing) =>  {
					args['limit'] = 1;
					listing.fetchMore({amount:0}).then((data) => {
						resolve(data);
					})
					.catch((err) =>{
						reject(err)
					})
				});
				break;*/
				
				
			default:
				console.log('sorry we can\'t find matching resolve type:' + resolveName);
				resolve(null);
		}
	});
}

/*---------------------helper function---------------------------*/
function commentTreeFlaten(o){
		
		currentNode = o;
		if (currentNode !== null && currentNode['replies']!== null){
			var children = currentNode['replies'];
			delete currentNode['replies'];
			agg_comments.push(currentNode);
			
			for (var i=0, length =children.length; i< length; i++){
				commentTreeFlaten(children[i])
			}
		}else if (currentNode !== null && currentNode['replies'] === null){
			var children = currentNode['replies'];
			delete currentNode['replies'];
			agg_comments.push(currentNode);
		}
		
}

function wait(ms){
	var start = Date.now(), now = start;
	while(now - start < ms){
		now = Date.now();
	}
}

module.exports = redditAPI;