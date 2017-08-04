require('dotenv').config();
var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var fs = require('fs');
//var path = require('path');
//var rootDIR = path.resolve('.');
var crypto = require('crypto');
var FormData = require('form-data');
var form = new FormData();

router.get('/login/reddit', function(req,res,next){
	crypto.randomBytes(24, function(err, buffer) {
		
		var RANDOM_STRING = buffer.toString('hex');
		req.session.state = RANDOM_STRING;
		
		var CLIENT_ID = process.env.REDDIT_CLIENT_ID;
		var clientSecret= process.env.REDDIT_CLIENT_SECRET;
		var URI = process.env.REDDIT_CALLBACK_URI;
		
		var DURATION = 'permanent';
		var SCOPE_STRING = 'identity edit flair history modconfig modflair modlog modposts modwiki mysubreddits privatemessages read report save submit subscribe vote wikiedit wikiread';
		
		var URL = `https://www.reddit.com/api/v1/authorize?client_id=` + CLIENT_ID + `&response_type=code&state=` 
		+ RANDOM_STRING +`&redirect_uri=` + URI +`&duration=` + DURATION + `&scope=` + SCOPE_STRING ;
		
		res.redirect(URL);     
	});
});

router.get('/login/reddit/callback',function(req,res,next){
	var user = process.env.REDDIT_CLIENT_ID;
	var password = process.env.REDDIT_CLIENT_SECRET;
	var grantType = 'authorization_code';
	var redirectURI = process.env.REDDIT_CALLBACK_URI;
	var base64encodedData = new Buffer(user + ':' + password).toString('base64');
	
	if (req.query.error){
		res.redirect('/query?error=' + JSON.stringify(req.query.error));
	}else if (req.query.state === req.session.state){
		fetch('https://www.reddit.com/api/v1/access_token', {method:'POST',
											headers:{
												'Authorization': 'Basic ' + base64encodedData,
												'Content-Type': "application/x-www-form-urlencoded",
												'user-agent': 'cwang138 testing various things v0.1',
											},
											body:"grant_type=" + grantType + "&code=" + req.query.code + "&redirect_uri=" + redirectURI
		}).then(function(response){
			return response.json();
		}).then(function(json){
			if ('error' in json){
				res.redirect('/query?error=' + json);
			}else{
				req.session.rd_access_token = json.access_token;
				req.session.rd_refresh_token = json.refresh_token;
				req.session.save();
				
				res.redirect('/query');
			}
		});
	}
});

module.exports = router;