//require('dotenv').config();
var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var crypto = require('crypto');


router.get('/login/reddit',function(req,res,next){
	req.session.currentURL = req.query.currentURL;
	req.session.save();
	
	res.render('search/auth',{
			bannerURL:"../bootstrap/img/logo/reddit-banner.png",
			endpoint:"../login/reddit",
			clauses:['Edit wiki pages on my behalf','Save and unsave comments and submissions.',
			'Read wiki pages through my account','Change editors and visibility of wiki pages in subreddits I moderate.',
			'Edit and delete my comments and submissions.','Submit and change my votes on comments and submissions.',
			'Access the list of subreddits I moderate, contribute to, and subscribe to.','Manage my subreddit subscriptions. Manage "friends" - users whose content I follow.',
			'Access my inbox and send private messages to other users.','Manage the configuration, sidebar, and CSS of subreddits I moderate.',
			'Access posts and comments through my account.','Access the moderation log in subreddits I moderate.',
			'Approve, remove, mark nsfw, and distinguish content in subreddits I moderate.','Manage and assign flair in subreddits I moderate.',
			'Report content for rules violations. Hide &amp; show individual submissions.','Select my subreddit flair. Change link flair on my submissions.',
			'Access my reddit username and signup date.',
			'Access my voting history and comments or submissions I\'ve saved or hidden.',
			' Maintain this access indefinitely (or until manually revoked).']});     
});

router.post('/login/reddit',function(req,res,next){

	var grantType = 'password';
	var user = "***REMOVED***";
	var password = "***REMOVED***";
	var base64encodedData = new Buffer(user + ':' + password).toString('base64');
	
	fetch('https://www.reddit.com/api/v1/access_token', {method:'POST',
											headers:{
												'Authorization': 'Basic ' + base64encodedData,
												'Content-Type': "application/x-www-form-urlencoded",
												'user-agent': 'cwang138 testing various things v0.1',
											},
											body:"grant_type=" + grantType + "&username=" + req.body.reddit_username + "&password=" + req.body.reddit_password
		}).then(function(response){
			return response.json();
		}).then(function(json){
			if ('error' in json){
				res.redirect(req.session.currentURL + 'query?error=' + JSON.stringify(json));
			}else{
				console.log(json.access_token);
				req.session.rd_access_token = json.access_token;
				res.redirect(req.session.currentURL + 'query');
				req.session.save();
			}
		});
		
});

module.exports = router;
