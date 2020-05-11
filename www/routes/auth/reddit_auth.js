var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var crypto = require('crypto');


router.get('/login/reddit', checkIfLoggedIn, function(req,res,next){
	//var grantType = 'https://oauth.reddit.com/grants/installed_client&';
	
	var user = REDDIT_CLIENT_ID;
	var password = REDDIT_CLIENT_SECRET;
	var base64encodedData = new Buffer.from(user + ':' + password).toString('base64');
	
	crypto.randomBytes(24, function(err, buffer) {
		var RANDOM_STRING = buffer.toString('hex');
		
		fetch('https://www.reddit.com/api/v1/access_token', {method:'POST',
												headers:{
													'Authorization': 'Basic ' + base64encodedData,
													'Content-Type': "application/x-www-form-urlencoded",
													'user-agent': 'TechServicesAnalytics@mx.uillinois.edu testing various things v0.1',
												},
												body:"grant_type=https://oauth.reddit.com/grants/installed_client&device_id=" + RANDOM_STRING
			}).then(function(response){
				return response.json();
			}).then(function(json){
				if ('error' in json){
                    res.send({ERROR: JSON.stringify(json)});
				}
				else{
					setCredential(req, 'rd_access_token', json['access_token']);
                    res.send({});
				}
			});
	});
		
});

module.exports = router;
