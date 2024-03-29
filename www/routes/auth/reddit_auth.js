var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var crypto = require('crypto');
var config = require('../../main_config');

router.get('/login/reddit',function(req,res,next){

	//var grantType = 'https://oauth.reddit.com/grants/installed_client&';
	
	var user = config.reddit.client_id;
	var password = config.reddit.client_secret;
	var base64encodedData = new Buffer(user + ':' + password).toString('base64');
	
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
                    res.cookie('reddit-success', 'false', {maxAge: 1000000000, httpOnly: false});
                    res.send({ERROR: JSON.stringify(json)});
				}else{
					req.session.rd_access_token = json.access_token;
					req.session.save();
					
					// set the cookie as true for 29 minutes maybe?
					res.cookie('reddit-success','true',{maxAge:1000*60*29, httpOnly:false});	
                    res.send({})

				}
			});
	});
		
});

module.exports = router;
