var googleAuth = require('google-auth-library');
var express = require('express');
var router = express.Router();
var clientId = '***REMOVED***';
var clientSecret = '***REMOVED***';
var redirectUrl = 'http://localhost:8001/login/google/callback';
var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

router.get('/login/google', function(req,res,next){
	
	console.log(req.query.currentURL);
	
	var authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: ['https://www.googleapis.com/auth/drive']
	});
	
	if (req.query.currentURL !== '/'){
		req.session.currentURL = req.query.currentURL;
		req.session.save();
	}
	
	res.redirect(authUrl);  
});

router.get('/login/google/callback',function(req,res,next){
	console.log('callback');
	
	oauth2Client.getToken(req.query.code, function(err, token) {
		if (err) {
			console.log('Error while trying to retrieve access token', err);
			res.send('Error while trying to retrieve access token', err);
		}
		req.session.google_access_token = token.access_token;
		req.session.save();
		console.log(req.session.currentURL);
		
		if (req.session.currentURL !== undefined){
			console.log(req.session.currentURL + '/?drive=googleDrive');
			res.redirect(req.session.currentURL + '/?drive=googleDrive');
		}else{
			res.redirect('/?drive=googleDrive');
		}
	});
	
	
});

module.exports = router;