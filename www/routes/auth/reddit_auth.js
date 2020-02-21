var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var crypto = require('crypto');

var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var isLoggedIn = require(path.join(appPath, 'scripts', 'helper_func', 'loginMiddleware.js'));

var redis = require('redis');
var client = redis.createClient();

client.on('error', function (err) {
    console.log('Error ' + err);
});

router.get('/login/reddit', isLoggedIn, function(req,res,next){
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
                    // res.cookie('reddit-success', 'false', {maxAge: 1000000000, httpOnly: false});
                    res.send({ERROR: JSON.stringify(json)});
				}else{
					client.hset(req.user.username, 'rd_access_token', json['access_token'], redis.print);
                    res.send({})
					// set the cookie as true for 29 minutes maybe?
					// res.cookie('reddit-success','true',{maxAge:1000*60*29, httpOnly:false});
				}
			});
	});
		
});

module.exports = router;
