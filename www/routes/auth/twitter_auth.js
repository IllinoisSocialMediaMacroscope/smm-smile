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
	consumer.getOAuthRequestToken({ 'oauth_callback': "https://socialmediamacroscope.org:8000" + req.query.currentURL + "login/twitter/callback"}, function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
		res.send("Error getting OAuth request token : " + util.inspect(error), 500);
    } else {  
		
		req.session.twt_oauthRequestToken = oauthToken;
		req.session.twt_oauthRequestTokenSecret = oauthTokenSecret; 
		req.session.currentURL = req.query.currentURL;
		req.session.save();
		res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.twt_oauthRequestToken);     
    }
  });
});

router.get('/login/twitter/callback',function(req,res,next){
	
	consumer.getOAuthAccessToken(req.session.twt_oauthRequestToken,req.session.twt_oauthRequestTokenSecret, 
		req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
			if (error) {
				res.redirect('/query?error=' + JSON.stringify(error));
			} else {
				
				// save in the session
				req.session.twt_access_token_key = oauthAccessToken;
				req.session.twt_access_token_secret = oauthAccessTokenSecret;
				req.session.save();
				
				// set the cookie as true for 29 minutes maybe?
				res.cookie('twitter-success','true',{maxAge:1000*60*29, httpOnly:false});	
				res.cookie('twitter-later','false',{maxAge:1000*60*29, httpOnly:false});
				res.redirect(req.session.currentURL + 'query');
			}
		});

});
	
module.exports = router;
