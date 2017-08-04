//require('dotenv').config();
var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var fs = require('fs');
var path = require('path');
var rootDIR = path.resolve('.');

router.get('/login/es', function(req,res,next){
	//mock
	req.session.es_access_token = 'placeholder';
	req.session.es_access_token_secret = 'placeholder';
	req.session.save();
	
	res.redirect('/query');
});

module.exports = router;