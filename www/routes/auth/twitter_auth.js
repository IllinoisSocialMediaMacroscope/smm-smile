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
            setCredential(req, 'twt_oauthRequestToken', oauthToken);
            setCredential(req, 'twt_oauthRequestTokenSecret', oauthTokenSecret);
            res.redirect("https://twitter.com/oauth/authorize?oauth_token=" + oauthToken);
        }
    });
});

router.post('/login/twitter', checkIfLoggedIn, function (req, res, next) {
    retrieveCredentials(req).then(obj =>{
        consumer.getOAuthAccessToken(obj['twt_oauthRequestToken'], obj['twt_oauthRequestTokenSecret'],
            req.body.twt_pin, function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
                if (error) {
                    res.send({ERROR: JSON.stringify(error)});
                }
                else {
                    setCredential(req, 'twt_access_token_key', oauthAccessToken);
                    setCredential(req, 'twt_access_token_secret', oauthAccessTokenSecret);
                    res.send({});
                }
            });
    })
    .catch(err =>{
        res.send({ERROR: JSON.stringify(error)});
    });
});

module.exports = router;
