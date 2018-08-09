var googleAuth = require('google-auth-library');
var express = require('express');
var router = express.Router();
var config = require('../../main_config');

var clientId = config.google.client_id;
var clientSecret = config.google.client_secret;
var redirectUrl = 'urn:ietf:wg:oauth:2.0:oob';
var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(clientId, clientSecret,redirectUrl);

router.get('/login/google', function(req,res,next){
	
	var authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: ['https://www.googleapis.com/auth/drive']
	});

	res.redirect(authUrl);  
});

router.post('/login/google',function(req,res,next){
	
	oauth2Client.getToken(req.body.authorizeCode, function(err, token) {
		if (err) {
            console.log('Error while trying to retrieve access token', err);
            res.send({'ERROR':err});
        }else{
			req.session.google_access_token = token.access_token;
			req.session.save();
			
			res.send({'data':'success'});
		}
	});
	
	
});

module.exports = router;
