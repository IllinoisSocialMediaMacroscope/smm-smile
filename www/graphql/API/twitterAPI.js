var Twitter = require('twitter');
var Promise = require('bluebird');
var querystring = require('querystring');    // parse query parameters
var config = require('../graphql_config.json');

function twitterAPI(tokens,resolveName, id, args){
	
	// using twitterstreamingapi2sample@lists.illinonis.edu
	var client = new Twitter({
			consumer_key:config.twitter.client_id,
			consumer_secret:config.twitter.client_secret,
			access_token_key:tokens.twtaccesstokenkey,
			access_token_secret:tokens.twtaccesstokensecret
		})
	
	return new Promise((resolve,reject) =>{
		switch(resolveName){	
			
			case 'searchUser':
				args['page'] = args['pageNum'];
				delete args['pageNum'];
				client.get('users/search',args,function(error,tweets,response){
					if(error){
						console.log(error);
						reject(JSON.stringify(error));
					}
					resolve(tweets);
				});
				break;
				
			case 'searchTweet':
				var max_pages = args['pages']-1;
				delete args['pages']; //pages is a made up field that doesn't belong to the original twitter api parameters
				
				client.get('search/tweets',args,function(error,tweets,response){
					if (error){
						console.log(error);
						reject(JSON.stringify(error));
					}
					
					if (max_pages === 0 || tweets['search_metadata'] === undefined || !('next_results' in tweets['search_metadata'])){
						//console.log(tweets['search_metadata']);
						resolve(tweets.statuses);
					}else{
						//console.log(tweets['search_metadata']);
						var result = tweets;			
						// be careful! asyc iteration!!!
						//args[pages] is the maximum page you want to iterate over
						WaterfallOver(max_pages, tweets, function(item,report){
										
							var newArgs = querystring.parse(item['search_metadata']['next_results'].slice(1));
							//console.log(newArgs);
							
							client.get('search/tweets',newArgs,function(error,newTweets,response){
								if(error) reject(error);
								result['statuses'] = item['statuses'].concat(newTweets['statuses']);
								item['search_metadata'] = newTweets['search_metadata']; //update the search with next result(page)
								report(item);
							});				
						}, function(){
							resolve(result.statuses);
						});
					}
					
				});
				break;
		
		
			case 'searchGeo':
				client.get('geo/search',args,function(error,tweets,response){
					if (error) reject(error);
					resolve(tweets.result.places);
				});
				break;
				
				
			case 'fetchTimeline':
				
				args['user_id'] = id;
				client.get('statuses/user_timeline',args,function(error,tweets,response){
					if (error) reject(error);
					//console.log(tweets);
					resolve(tweets);
				});
				break;
				
			case 'fetchRetweet':
				client.get('statuses/retweets/' + tweet.id_str, args, function(error,tweets,response){
					if (error) reject(error);
					//console.log(tweets);
					resolve(tweets);
				});
				break;
	
			case 'fetchFriend':
				args['user_id'] = id;
				client.get('friends/list',args,function(error,tweets,response){
					if (error) reject(error);
					//console.log(tweets);
					resolve(tweets.users);
				});
				break;
			
			case 'fetchFollower':
				args['user_id'] = id;
				client.get('followers/list',args,function(error,tweets,response){
					if (error) reject(error);
					//console.log(tweets);
					resolve(tweets.users);
				});
				break;

			case 'statusesLookup':
				client.get('statuses/lookup', args, function(error, tweets, response){
					if (error) {
                        console.log(error);
                        reject(error);
                    }
					resolve(tweets);
				})
                break;

			default:
				console.log('sorry we can\'t find matching resolve type:' + resolveName);
				resolve(null);
		}
	});
}

/*--------------------helper--------------------------------------------------------------------------------------*/
function WaterfallOver2(max_pages,page, iterator, callback) {

    var nextItemIndex = 0;  //keep track of the index of the next item to be processed

    function report(item) {

        nextItemIndex++;
		
		//next results is a string:?max_id=875733529404948479&q=UIUC&count=1&include_entities=1&result_type=mixed
		//parse it will give you new args
		//now think a recursive way 
		//console.log(item);	
		// you dont want to reach the bottom of search; OR exceed the req limit of 180 calls per 15 min
        if(nextItemIndex === max_pages)
            callback(); //if all the reports are back, great! resolve the result
        else
            iterator(item, report); //keep iterate
    }

    // instead of starting all the iterations, we only start the 1st one
    iterator(page, report);
}

function WaterfallOver(max_pages,tweets, iterator, callback) {

    var nextItemIndex = 0;  //keep track of the index of the next item to be processed

    function report(item) {

        nextItemIndex++;
		
		//next results is a string:?max_id=875733529404948479&q=UIUC&count=1&include_entities=1&result_type=mixed
		//parse it will give you new args
		//now think a recursive way 
		//console.log(item);	
		// you dont want to reach the bottom of search; OR exceed the req limit of 180 calls per 15 min
        if(nextItemIndex === max_pages || !("next_results" in item['search_metadata']))
            callback(); //if all the reports are back, great! resolve the result
        else
            iterator(item, report); //keep iterate
    }

    // instead of starting all the iterations, we only start the 1st one
    iterator(tweets, report);
}



module.exports = twitterAPI;
