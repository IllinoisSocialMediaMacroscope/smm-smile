require('dotenv').config();
var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var fs = require('fs');
//var path = require('path');
//var rootDIR = path.resolve('.');
var OAuth1 = require('OAuth').OAuth;
var consumer = new OAuth1(
	"https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token", 
	process.env.TWITTER_CLIENT_ID, process.env.TWITTER_CLIENT_SECRET, "1.0", process.env.TWITTER_CALLBACK_URI, "HMAC-SHA1");

router.get('/login/twitter', function(req,res,next){

	consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
    if (error) {
		res.send("Error getting OAuth request token : " + util.inspect(error), 500);
    } else {  
		
		req.session.twt_oauthRequestToken = oauthToken;
		req.session.twt_oauthRequestTokenSecret = oauthTokenSecret; 
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
				
				res.redirect('/query');
			}
		});

});
	
module.exports = router;