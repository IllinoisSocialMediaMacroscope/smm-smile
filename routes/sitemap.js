require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var lunr = require('lunr');

router.post('/sitemap',function(req,res,next){
	
	var documents = [
		{
		  "name": "index",
		  "url": "/",
		  "text": ""
		},
		{
		  "name": "networkx",
		  "text": "",
		  "url":""
		}, 
		{
		  "name": "scikit learn clustering",
		  "text": ""
		},
		{
			"name":"Natural Language Processing Tokenization",
			"text": ""
		},
		{	
			"name": "Natural Language Processing Sentiment Analysis",
			"text":""
		},
		{
			"name": "Search Social Media Source",
			"text":""
		},
		{
			"name": "History page",
			"text":""
		}
	]
		
	var idx = lunr(function () {
		this.ref('url')
		this.field('text')
		this.filed('name')
		documents.forEach(function (doc) {
			this.add(doc)
			}, this)
	})
	
	var result = idx.search(req.body.searchTerm);
	
	console.log(result);
});

module.exports = router;