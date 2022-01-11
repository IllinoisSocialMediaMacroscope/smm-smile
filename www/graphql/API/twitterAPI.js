var Twitter = require('twitter');
var Promise = require('bluebird');
var querystring = require('querystring');    // parse query parameters
var bigInt = require("big-integer");
var config = require('../graphql_config.json');

function twitterAPI(tokens,resolveName, id, args){
	
	// using twitterstreamingapi2sample@lists.illinonis.edu
	var client = new Twitter({
			consumer_key:config.twitter.client_id,
			consumer_secret:config.twitter.client_secret,
			access_token_key:tokens.twtaccesstokenkey,
			access_token_secret:tokens.twtaccesstokensecret
		});
	
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

				// add extended tweets
                args['tweet_mode'] = 'extended';

				client.get('search/tweets',args,function(error,tweets,response){
					if (error){
						console.log(error);
						reject(JSON.stringify(error));
					}
                    if (tweets!== undefined && tweets['errors'] !== undefined){
                        reject(JSON.stringify(tweets['errors'][0]));
                    }

					if (max_pages === 0 || tweets['search_metadata'] === undefined || !('next_results' in tweets['search_metadata'])){
						resolve(tweets.statuses);
					}else{
						var result = tweets;
						// be careful! asyc iteration!!!
						//args[pages] is the maximum page you want to iterate over
						WaterfallOver(max_pages, tweets, function(item,report){

							var newArgs = querystring.parse(item['search_metadata']['next_results'].slice(1));
							newArgs = Object.assign(newArgs, args);

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

            case 'searchTimeline':
                var max_pages = args['pages']-1;
                delete args['pages'];

                // add extended tweets
                args['tweet_mode'] = 'extended';

                client.get('statuses/user_timeline',args,function(error,tweets,response){
                    if (error){
                        console.log(error);
                        reject(JSON.stringify(error));
                    }

                    if (tweets!== undefined && tweets['errors'] !== undefined){
                        reject(JSON.stringify(tweets['errors'][0]));
                    }

                    if (max_pages === 0){
                        resolve(tweets);
                    }else{
                        var result = tweets;
                        WaterfallOver2(max_pages, tweets, function(item,report){
                        	if (item.length > 0){
                                // Returns results with an ID less than (that is, older than) or equal to the specified ID.
                                // that means we might get the same tweet as the specified max_id, hence -1
                                var max_id = bigInt(item[item.length-1]['id']);
								args['max_id'] = max_id.minus(1).toString();
                                client.get('statuses/user_timeline',args,function(error,newTweets,response){
                                    if(error) reject(error);

                                    if (newTweets.length > 0){
                                        result = result.concat(newTweets);
                                        item = newTweets;
                                        report(item);
									}

                                });
							}
							else{
                        		report(item);
							}
                        }, function(){
                            resolve(result);
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

                // add extended tweets
                args['tweet_mode'] = 'extended';
				args['user_id'] = id;

				client.get('statuses/user_timeline',args,function(error,tweets,response){
					if (error) reject(error);
					resolve(tweets);
				});
				break;
				
			case 'fetchRetweet':
				client.get('statuses/retweets/' + tweet.id_str, args, function(error,tweets,response){
					if (error) reject(error);
					resolve(tweets);
				});
				break;
	
			case 'fetchFriend':
				args['user_id'] = id;
				client.get('friends/list',args,function(error,tweets,response){
					if (error) reject(error);
					resolve(tweets.users);
				});
				break;
			
			case 'fetchFollower':
				args['user_id'] = id;
				client.get('followers/list',args,function(error,tweets,response){
					if (error) reject(error);
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
				});
                break;

			default:
				console.log('sorry we can\'t find matching resolve type:' + resolveName);
				resolve(null);
		}
	});
}

/*--------------------helper--------------------------------------------------------------------------------------*/
function WaterfallOver(max_pages,tweets, iterator, callback) {

    var nextItemIndex = 0;  //keep track of the index of the next item to be processed

    function report(item) {

        nextItemIndex++;
		
		//next results is a string:?max_id=875733529404948479&q=UIUC&count=1&include_entities=1&result_type=mixed
		//parse it will give you new args
		//now think a recursive way 
		// you dont want to reach the bottom of search; OR exceed the req limit of 180 calls per 15 min
        if(nextItemIndex === max_pages || item['search_metadata'] === undefined || !("next_results" in item['search_metadata']))
            callback(); //if all the reports are back, great! resolve the result
        else
            iterator(item, report); //keep iterate
    }

    // instead of starting all the iterations, we only start the 1st one
    iterator(tweets, report);
}

function WaterfallOver2(max_pages,tweets, iterator, callback) {

    var nextItemIndex = 0;  //keep track of the index of the next item to be processed

    function report(item) {

        nextItemIndex++;
        if(nextItemIndex === max_pages)
            callback(); //if all the reports are back, great! resolve the result
        else
            iterator(item, report); //keep iterate
    }

    // instead of starting all the iterations, we only start the 1st one
    iterator(tweets, report);
}


module.exports = twitterAPI;
