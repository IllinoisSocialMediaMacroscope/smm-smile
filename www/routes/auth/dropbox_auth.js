var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var isLoggedIn = require(path.join(appPath, 'scripts', 'helper_func', 'loginMiddleware.js'));

var redis = require('redis');
var client = redis.createClient("redis://redis");

router.get('/login/dropbox', isLoggedIn, function(req,res,next){
	var authUrl = "https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=" + DROPBOX_CLIENT_ID;
	res.redirect(authUrl);
});

router.post('/login/dropbox',function(req,res,next){
	var user = DROPBOX_CLIENT_ID;
	var password = DROPBOX_CLIENT_SECRET;
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
        	client.hset(req.user.username, 'dropbox_access_token', json.access_token, redis.print);
        	client.expire(req.user.username, 30 * 60);
			res.send({'data':'success'});
		});
});

module.exports = router;
