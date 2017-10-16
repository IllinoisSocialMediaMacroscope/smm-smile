var googleAuth = require('google-auth-library');
var express = require('express');
var router = express.Router();
var clientId = '***REMOVED***';
var clientSecret = '***REMOVED***';
var redirectUrl = 'http://localhost:8001/login/google/callback';
var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

router.get('/login/google', function(req,res,next){
	

	var authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: ['https://www.googleapis.com/auth/drive']
	});

	res.redirect(authUrl);  
});

router.get('/login/google/callback',function(req,res,next){
	
	oauth2Client.getToken(req.query.code, function(err, token) {
		if (err) {
			console.log('Error while trying to retrieve access token', err);
			res.send('Error while trying to retrieve access token', err);
		}
		req.session.google_access_token = token.access_token;
		req.session.save();
		res.redirect('/?drive=googleDrive');
	});
	
	
});

module.exports = router;