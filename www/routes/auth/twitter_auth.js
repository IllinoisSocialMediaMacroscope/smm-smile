var express = require('express');
var router = express.Router();
var OAuth1 = require('oauth').OAuth;

var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var isLoggedIn = require(path.join(appPath, 'scripts', 'helper_func', 'loginMiddleware.js'));

var redis = require('redis');
var client = redis.createClient();

var consumer = new OAuth1(
    "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
    TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, "1.0", "http://localhost:8001/login/twitter/callback", "HMAC-SHA1");

router.get('/login/twitter', isLoggedIn, function (req, res, next) {
    // patch the oauth library node_modules/oauth/lib/oauth.js, line 540 add: extraParams["oauth_callback"]===undefined
    consumer.getOAuthRequestToken({'oauth_callback': "oob"}, function (error, oauthToken, oauthTokenSecret, results) {
        if (error) {
            res.send({ERROR: JSON.stringify(error)});
        } else {
            client.hset(req.user.username, 'twt_oauthRequestToken', oauthToken, redis.print);
            client.hset(req.user.username, 'twt_oauthRequestTokenSecret', oauthTokenSecret, redis.print);
            client.expire(req.user.username, 30 * 60);
            res.redirect("https://twitter.com/oauth/authorize?oauth_token=" + oauthToken);
        }
    });
});

router.post('/login/twitter', isLoggedIn, function (req, res, next) {
    client.hgetall(req.user.username, function (err, obj) {
        if (err) {
            console.log(err);
            reject(err);
        }
        else {
            consumer.getOAuthAccessToken(obj['twt_oauthRequestToken'], obj['twt_oauthRequestTokenSecret'],
                req.body.twt_pin, function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
                if (error) {
                    res.send({ERROR: JSON.stringify(error)});
                } else {
                    client.hset(req.user.username, 'twt_access_token_key', oauthAccessToken, redis.print);
                    client.hset(req.user.username, 'twt_access_token_secret', oauthAccessTokenSecret, redis.print);
                    client.expire(req.user.username, 30 * 60);
                    res.send({});
                }
            });
        }
    });
});

module.exports = router;
