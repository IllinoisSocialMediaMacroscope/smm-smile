var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var BoxSDK = require('box-node-sdk');
var config = require('../../main_config');

router.get('/login/box', function(req,res,next){
	
	//save the current page in session, so later can redirect to the same page after getting accesstoken
	//TODO write this in cookie so no worry about which page!!!!!
	req.session.pageURL = req.query.pageURL;
	req.session.currentURL = req.query.currentURL;
	req.session.save();
	
	var authUrl = `https://account.box.com/api/oauth2/authorize?response_type=code&client_id=`
	+ BOX_CLIENT_ID
	+`&redirect_uri=https://socialmediamacroscope.org:8000` + req.query.currentURL +`login/box/callback`;
	// +`&redirect_uri=http://localhost:8001` + req.query.currentURL +`login/box/callback`;

	res.redirect(authUrl);
});

router.get('/login/box/callback',function(req,res,next){
	var box = new BoxSDK({
		clientID: BOX_CLIENT_ID,
		clientSecret: BOX_CLIENT_SECRET
	});
	
	if (req.query.error !== undefined){
		res.redirect(req.session.currentURL + req.session.pageURL + '?error=' + req.query.error);
	}else{
		box.getTokensAuthorizationCodeGrant(req.query.code, null, function(err, tokenInfo) {
			if (err){
				res.cookie('box-success','false',{maxAge:1000*60*60*24*365, httpOnly:false});	
				res.redirect(req.session.currentURL + req.session.pageURL + '?error=' + err);
			}else{
				req.session.box_access_token = tokenInfo.accessToken;
				req.session.save();
				
				// put this in the cookie so we know add this export button
				res.redirect(req.session.currentURL + req.session.pageURL + '?box=success');
			}
		});
	}
});

module.exports = router;
