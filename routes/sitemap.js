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
		  "text": fs.readFileSync(process.env.ROOTDIR + '/routes/index.js', "utf8")
		},
		{
		  "name": "networkx",
		  "text": fs.readFileSync(process.env.ROOTDIR + '/routes/networkx/networkx.json'),
		  "url":"/networkx"
		}, 
		{
		  "name": "scikit learn clustering",
		  "text": fs.readFileSync(process.env.ROOTDIR + '/routes/scikit-learn/cluster.json'),
		  "url":"/sklearn/cluster",
		},
		{
			"name":"Natural Language Processing Tokenization",
			"text": "",
			"url":"/NLP/preprocess",
		},
		{	
			"name": "Natural Language Processing Sentiment Analysis",
			"url":"/NLP/sentiment",
			"text":"",
		},
		{
			"name": "Search Social Media Source",
			"url":"/query",
			"text":"",
		},
		{
			"name": "History page",
			"text":"",
			"url":"/history"
		}
	]
		
	var idx = lunr(function () {
		this.ref('url')
		this.field('text')
		this.field('name')
		documents.forEach(function (doc) {
			this.add(doc)
			}, this)
	})
	
	var result = JSON.stringify(idx.search(req.body.searchTerm));
	
	console.log(result);
});

module.exports = router;