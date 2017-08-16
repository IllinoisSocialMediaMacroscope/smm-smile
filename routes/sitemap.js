require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var lunr = require('lunr');

router.post('/sitemap',function(req,res,next){
	
	var documents = [
		{
		  "tags": "index; home; homepage; introduction; social media analytics;tool overview; tools; wiki; wikipedia page; reading materials;",
		  "url": "/",
		  "text": fs.readFileSync(process.env.ROOTDIR + '/routes/index.js', "utf8")
		},
		{
		  "tags": `network; visualization; metrics; assortativity; centrality; cluster; component; hierarchy;
		  path; traversal; tree; triads; vitality; connectivity; python; networkx package; plotly; twitter;
		  relationship; tweet; user; `,
		  "text": fs.readFileSync(process.env.ROOTDIR + '/routes/networkx/networkx.json'),
		  "url":"/networkx"
		}, 
		{
		  "tags": `scikit learn; python; clustering; cluster; unsupervised learning; machine learning; 
		  learn; train; function; data; algorithm; output; set; regression; variance; features; bias;
		  minimizationl; examples; space; cluster; vector; linear; penalty; model; dimension;`,
		  "text": fs.readFileSync(process.env.ROOTDIR + '/routes/scikit-learn/cluster.json'),
		  "url":"/sklearn/cluster",
		},
		{
			"tags":`natural language; preprocess; process; tokenize; lexer; word; tokens; lexical; lemma; lemmatization; 
				stem; stemming; grammatical; verb; plural; corpus; context; simplified;adjectives; adverbs; nouns;characters;
				phrase; sentence; language; parser; posTag; string; generator; word tree; 
				analysis; grammar; statement; literal; rule; tokenization; expression; comments; 
				sequence; semantic; structure; NLTK; python; stanford; syntax; tweet;`,
			"text": fs.readFileSync(process.env.ROOTDIR + '/routes/NLP/preprocess.json'),
			"url":"/NLP/preprocess",
		},
		{	
			"tags": `natural language; process; lexer; sentence; lexical; document; language; 
			analysis; rule; NLTK; python; stanford; tweet; sentiment; text; proceeding; positive; negative; neutral;
			compound; reviews; features; system; polarity; language; opinion; recommender; content; 
			affect; mining; social; linguistics; emotion; emotional; human; semantic; rating; subjective; pyschology;`,
			"url":"/NLP/sentiment",
			"text":fs.readFileSync(process.env.ROOTDIR + '/routes/NLP/sentiment.json'),
		},
		{
			"tags": `search; query; social media; source; platform; authentication; authorization; access tokens; credentials; graphql; data server; elasticsearch;
			user; twitter; stream; tweet; user; online; information; journal; network; communication; topics; trend; keyword; meme; hashtag; @; retweet; url; image;
			emoji;`,
			"url":"/query",
			"text":fs.readFileSync(process.env.ROOTDIR + '/views/search/searchbox.pug') + 
			fs.readFileSync(process.env.ROOTDIR + '/views/search/query.pug'),
		},
		{
			"tags": "history; past; id; analytics; data; metrics; chart; graph;",
			"text":fs.readFileSync(process.env.ROOTDIR + '/views/history.pug'),
			"url":"/history"
		}
	]
		
	var idx = lunr(function () {
		this.ref('url')
		//this.ref('tags')
		this.field('text')
		this.field('tags')
		documents.forEach(function (doc) {
			this.add(doc)
			}, this)
	})
	
	// use hashtable to look up the match URL with name and tags
	var hashtable = { 
		"/":"Homepage",
		"/networkx":"Network visualization and analysis",
		"/sklearn/cluster":"Unsupervised learning",
		"/NLP/preprocess":"Natural language preprocessing",
		"/NLP/sentiment":"Sentiment analysis",
		"/query":"Social media search",
		"/history":"Saved data and analytics results"
	}		
		
	var match = idx.search(req.body.searchTerm);
	
	var display = [];
	match.forEach(function(item){
		var display_item = {};
		display_item['url']  = item.ref;
		display_item['pageName'] = hashtable[item.ref];
		display.push(display_item);
	});
	res.send(display);
	
});

module.exports = router;