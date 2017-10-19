var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var BoxSDK = require('box-node-sdk');

router.get('/login/box', function(req,res,next){
	
	//save the current page in session, so later can redirect to the same page after getting accesstoken
	//TODO write this in cookie so no worry about which page!!!!!
	req.session.pageURL = req.query.pageURL;
	req.session.currentURL = req.query.currentURL;
	req.session.save();
	
	var authUrl = `https://account.box.com/api/oauth2/authorize?response_type=code&client_id=***REMOVED***&redirect_uri=https://socialmediamacroscope.org:8000` + req.query.currentURL +`login/box/callback`;
	res.redirect(authUrl);
});

router.get('/login/box/callback',function(req,res,next){
	var box = new BoxSDK({
		clientID: '***REMOVED***', 
		clientSecret: '***REMOVED***' 
	});
	
	box.getTokensAuthorizationCodeGrant(req.query.code, null, function(err, tokenInfo) {
		if (err){
			res.redirect(`/` + req.session.pageURL + `?box=` + JSON.stringify({'ERROR':err}))
		}else{
			req.session.box_access_token = tokenInfo.accessToken;
			req.session.save();
			
			// push this to the front so we know add this export button
			console.log(req.session.currentURL);
			console.log(req.session.pageURL);
			res.redirect(req.session.currentURL + req.session.pageURL + `?box=success`);
		}
	});
});

module.exports = router;