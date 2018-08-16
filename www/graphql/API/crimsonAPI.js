var Promise = require('bluebird');
var fetch = require('node-fetch');
var appendQuery = require('append-query');
var twitterAPI = require('./twitterAPI');

function crimsonAPI(tokens, args) {
    args['auth'] = tokens.crimsonaccesstoken;
    var twitter = args['twitter'];

    delete args.twitter;

    return new Promise((resolve, reject) => {
        var endpoint = appendQuery('https://api.crimsonhexagon.com/api/monitor/posts', args);
        fetch(endpoint).then((res) => {
            return res.json();
        })
        .then(function (json) {

            var twitter_posts = [];
            var other_posts = [];

            // add quotation mark around blog contents
            for (var i=0, length=json.posts.length; i<length; i++){
                if (json.posts[i]['contents'] !== undefined){
                    // line break change to '.'
                    json.posts[i]['contents'] = json.posts[i]['contents'].replace(/\n/g, ".");
                    json.posts[i]['title'] = json.posts[i]['title'].replace(/\n/g, ".");

                    // " change to '
                    json.posts[i]['contents'] = json.posts[i]['contents'].replace(/"/g, "'");
                    json.posts[i]['title'] = json.posts[i]['title'].replace(/"/g, "'");
                }
            }

            // seperate twitter type vs other type
            for (var i = 0, length = json.posts.length; i < length; i++) {
                if (json.posts[i]['type'] === 'Twitter') {
                    twitter_posts.push(json.posts[i]);
                }
                else {
                    other_posts.push(json.posts[i]);
                }
            }

            if (twitter=== 'on') {
                console.log('trade id for twitter text!');
                // in twitter type get id and put them in array
                var tweet_id = [];
                for (var i = 0, length = twitter_posts.length; i < length; i++) {
                    var url_parts = twitter_posts[i]['url'].split('/');
                    var id = url_parts.slice(-1)[0];

                    // record the twitter id for future purpose
                    twitter_posts[i]['tweet_id'] = id;
                    tweet_id.push(id);
                }

                //in array seperate them into every 100
                var promise_array = [];
                for (var i = 0, length = tweet_id.length; i < length; i += 100) {
                    var args = {};
                    args['id'] = tweet_id.slice(i, i + 100).join(',');
                    promise_array.push(twitterAPI(tokens, 'statusesLookup', '', args));
                }

                Promise.all(promise_array).then(function (results) {
                    for (var i = 0, length_i = results.length; i < length_i; i++) {

                        for (var j = 0, length_j = results[i].length; j < length_j; j++) {

                            for (var k = 0, length_k = twitter_posts.length; k < length_k; k++) {

                                if (twitter_posts[k] !== undefined &&
                                    results[i][j] !== undefined &&
                                    results[i][j]['id_str'] === twitter_posts[k]['tweet_id']) {
                                    twitter_posts[k]['contents'] = results[i][j]['text'];
                                    twitter_posts[k]['author'] = results[i][j]['user']['screen_name'];
                                }

                            }
                        }
                    }

                    resolve(twitter_posts.concat(other_posts));
                });
            }
            else{
                resolve(twitter_posts.concat(other_posts));
            }

        }).catch((err) => {
            //console.log(err);
            reject(err);
        });
    });
}

module.exports = crimsonAPI;
