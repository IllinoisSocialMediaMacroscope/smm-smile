//require('dotenv').config();
var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var crypto = require('crypto');

// this implicit workflow doesn't work!!!!!
/* router.get('/login/synthesio', function(req,res,next){
	crypto.randomBytes(24, function(err, buffer) {
		
		var RANDOM_STRING = buffer.toString('hex');
		req.session.state = RANDOM_STRING;
		
		var CLIENT_ID = "715bff6b-35d7-3f77-be4f-4fda4e77b11e";
		var CLIENT_SECRET= "a51d6d53-8487-34ff-9059-4a5917675c51";
		var REDIRECT_URI = "http://localhost:8001/login/synthesio/callback";
		
		var URL = `https://app.synthesio.com/authorize.php?client_id=` + CLIENT_ID 
		+ `&client_secret=` + CLIENT_SECRET 
		+ `&response_type=token&redirect_uri=` 
		+ REDIRECT_URI + `&scope=read`;
		
		console.log(URL);
		res.redirect(URL);     
	});
});

router.get('/login/synthesio/callback',function(req,res,next){
	
	req.session.synthesio_access_token = req.query.access_token;
	console.log(req.session.synthesio_access_token);
	
	req.session.save();
	res.redirect('/query');
	
});*/

// write a username and password workflow?

module.exports = router;