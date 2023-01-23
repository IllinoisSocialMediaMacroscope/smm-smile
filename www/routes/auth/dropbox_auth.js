var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');


router.get('/login/dropbox', checkIfLoggedIn, function(req,res,next){
	var authUrl = "https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=" + DROPBOX_CLIENT_ID;
	res.redirect(authUrl);
});

router.post('/login/dropbox',function(req,res,next){
	var user = DROPBOX_CLIENT_ID;
	var password = DROPBOX_CLIENT_SECRET;
	var base64encodedData = new Buffer.from(user + ':' + password).toString('base64');
	fetch('https://api.dropboxapi.com/1/oauth2/token', {method:'POST',
											headers:{
												'Authorization': 'Basic ' + base64encodedData,
												'Content-Type': "application/x-www-form-urlencoded",
												'user-agent': 'TechServicesAnalytics@mx.uillinois.edu testing various things v0.1',
											},
											body:"grant_type=authorization_code&code=" + req.body.authorizeCode
							
		}).then(function(response){
			return response.json();
		}).then(function(json){
			if ('error' in json){
				res.send({'ERROR':json.error});
			}

			setCredential(req, 'dropbox_access_token', json.access_token);
			res.send({'data': 'success'});
		});
});

module.exports = router;
