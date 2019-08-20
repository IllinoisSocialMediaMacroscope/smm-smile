var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var OAuth1 = require('oauth').OAuth;
var config = require('../../main_config.json');

var consumer = new OAuth1(
        "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token", 
        config.twitter.client_id, config.twitter.client_secret, "1.0", "http://localhost:8001/login/twitter/callback", "HMAC-SHA1");

router.get('/login/twitter', function(req,res,next){
    // patch the oauth library node_modules/oauth/lib/oauth.js, line 540 add: extraParams["oauth_callback"]===undefined
	consumer.getOAuthRequestToken({ 'oauth_callback': "oob"}, function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
    	res.send({ERROR: JSON.stringify(error)});
    } else {
		req.session.twt_oauthRequestToken = oauthToken;
		req.session.twt_oauthRequestTokenSecret = oauthTokenSecret;
		req.session.save();
		res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.twt_oauthRequestToken);     
    }
  });
});

router.post('/login/twitter',function(req,res,next){
	consumer.getOAuthAccessToken(req.session.twt_oauthRequestToken,req.session.twt_oauthRequestTokenSecret, 
		req.body.twt_pin, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
			if (error) {
                res.cookie('twitter-success', 'false', {maxAge: 1000000000, httpOnly: false});
				res.send({ERROR: JSON.stringify(error)});
			} else {
				// save in the session
				req.session.twt_access_token_key = oauthAccessToken;
				req.session.twt_access_token_secret = oauthAccessTokenSecret;
				req.session.save();
				
				// set the cookie as true for 29 minutes maybe?
				res.cookie('twitter-success','true',{maxAge:1000*60*29, httpOnly:false});	
				res.send({});
			}
		});

});
	
module.exports = router;
