var express = require('express');
var router = express.Router();
var OAuth1 = require('oauth').OAuth;

var consumer = new OAuth1(
    "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
    TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, "1.0", "http://localhost:8001/login/twitter/callback", "HMAC-SHA1");

router.get('/login/twitter', checkIfLoggedIn, function (req, res, next) {
    // patch the oauth library node_modules/oauth/lib/oauth.js, line 540 add: extraParams["oauth_callback"]===undefined
    consumer.getOAuthRequestToken({'oauth_callback': "oob"}, function (error, oauthToken, oauthTokenSecret, results) {
        if (error) {
            res.send({ERROR: JSON.stringify(error)});
        } else {
            if (process.env.DOCKERIZED === 'true'){
                redisClient.hset(req.user.username, 'twt_oauthRequestToken', oauthToken, redis.print);
                redisClient.hset(req.user.username, 'twt_oauthRequestTokenSecret', oauthTokenSecret, redis.print);
                redisClient.expire(req.user.username, 30 * 60);
            }
            else{
                req.session.twt_oauthRequestToken = oauthToken;
                req.session.twt_oauthRequestTokenSecret = oauthTokenSecret;
                req.session.save();
            }

            res.redirect("https://twitter.com/oauth/authorize?oauth_token=" + oauthToken);
        }
    });
});

router.post('/login/twitter', checkIfLoggedIn, function (req, res, next) {
    if (process.env.DOCKERIZED === 'true') {
        // save in the redis
        redisClient.hgetall(req.user.username, function (err, obj) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                consumer.getOAuthAccessToken(obj['twt_oauthRequestToken'], obj['twt_oauthRequestTokenSecret'],
                    req.body.twt_pin, function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
                        if (error) {
                            res.send({ERROR: JSON.stringify(error)});
                        }
                        else {
                            redisClient.hset(req.user.username, 'twt_access_token_key', oauthAccessToken, redis.print);
                            redisClient.hset(req.user.username, 'twt_access_token_secret', oauthAccessTokenSecret, redis.print);
                            redisClient.expire(req.user.username, 30 * 60);
                            res.send({});
                        }
                    });
            }
        });
    }
    else {
        // save in the session
        consumer.getOAuthAccessToken(req.session.twt_oauthRequestToken,req.session.twt_oauthRequestTokenSecret,
            req.body.twt_pin, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
                if (error) {
                    res.send({ERROR: JSON.stringify(error)});
                } else {
                    // save in the session
                    req.session.twt_access_token_key = oauthAccessToken;
                    req.session.twt_access_token_secret = oauthAccessTokenSecret;
                    req.session.save();
                    res.send({});
                }
            });
    }
});

module.exports = router;
