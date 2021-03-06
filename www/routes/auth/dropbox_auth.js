var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var config = require('../../main_config');

router.get('/login/dropbox', function(req,res,next){
	var authUrl = "https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=" + config.dropbox.client_id;
	res.redirect(authUrl);
});

router.post('/login/dropbox',function(req,res,next){
	var user = config.dropbox.client_id;
	var password = config.dropbox.client_secret;
	var base64encodedData = new Buffer(user + ':' + password).toString('base64');
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
			req.session.dropbox_access_token = json.access_token;
			req.session.save();
			res.send({'data':'success'});
		});
});

module.exports = router;
