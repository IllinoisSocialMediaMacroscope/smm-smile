var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	res.render('index',{ 
		pages:[
			/*{name:'search',url:'/query',imgURL:'bootstrap/img/logo/search-logo.svg',
						introduction:`placeholder`
			},*/
			{
			name:'Searching Social Media', url:'query', imgURL:'bootstrap/img/logo/search-smm.png',
			wiki:'https://en.wikipedia.org/wiki/Social_search',
			introduction: `SMILE empowers researchers to search content from multiple social media platforms all at once. 
			Find tweets, individual user accounts, and comments that match specific criteria, 
			and analyze content with just a few clicks. Both live and historical data are available for search.`
			},
			{name:'Pre-processing',url:'NLP-preprocess', imgURL:'bootstrap/img/logo/NLP/NLP-preprocess.png',
						wiki:'http://pages.cs.wisc.edu/~jerryzhu/cs769/text_preprocessing.pdf',
						introduction:`<a href="https://en.wikipedia.org/wiki/Text_segmentation#Word_segmentation"><b>Tokenization</b></a>
						 is the process of dividing written text into meaningful units, such as words, <a href="https://en.wikipedia.org/wiki/Sentence_(linguistics)">sentences
						</a>, or <a href="https://en.wikipedia.org/wiki/Topic_(linguistics)" title="Topic (linguistics)">topics</a>.
						<a href="https://nlp.stanford.edu/IR-book/html/htmledition/stemming-and-lemmatization-1.html"><b>Lemmatization and Stemming </b></a>
						reduces word forms to common base words.<a href="https://en.wikipedia.org/wiki/Part-of-speech_tagging">
						<b>Part-of-speech Tagging</b></a> is the process of marking up a word in a text 
						(corpus) as corresponding to a particular 
						<a href="https://en.wikipedia.org/wiki/Parts_of_speech">part of speech</a>, based on both 
						its definition and its context.`},
            {name:'Sentiment Analysis', url:'NLP-sentiment', imgURL:'bootstrap/img/logo/NLP/SA.png',
						wiki:'https://en.wikipedia.org/wiki/Sentiment_analysis',
						introduction:`<b>Sentiment analysis</b> (sometimes known as opinion mining or emotion AI) refers to the
						use of <a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Natural_language_processing">
						natural language processing</a>, <a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Text_analytics" >text analysis</a>, 
						<a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Computational_linguistics">computational linguistics</a>, and 
						<a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Biometrics">biometrics</a> to systematically identify, extract, 
						quantify, and study affective states and subjective information.`},
			/*{name:'Topic Modeling', url:'/NLP/topic', imgURL:'bootstrap/img/logo/NLP/topic-model.png',
						wiki:'https://en.wikipedia.org/wiki/Topic_model',
						introduction:`In <a href="https://en.wikipedia.org/wiki/Machine_learning">machine learning</a> and <a href="https://en.wikipedia.org/wiki/Natural_language_processing">natural language processing</a>, 
						a <b>topic model</b> is a type of <a href="https://en.wikipedia.org/wiki/Statistical_model">statistical model</a> 
						for discovering the abstract "topics" that occur in a collection of documents. Topic modeling is a frequently used text-mining 
						tool for discovery of hidden semantic structures in a text body. Intuitively, given that a document is about a particular topic, 
						one would expect particular words to appear in the document more or less frequently: "dog" and "bone" will appear more often in documents about dogs,
						"cat" and "meow" will appear in documents about cats, and "the" and "is" will appear equally in both. A document typically concerns multiple topics 
						in different proportions; thus, in a document that is 10% about cats and 90% about dogs, there would probably be about 9 times more dog words than cat words. 
						The "topics" produced by topic modeling techniques are clusters of similar words.`},*/
			{name: 'Clustering', url:'sklearn-cluster', imgURL:'bootstrap/img/logo/sklearn/cluster.png',
						wiki:'https://en.wikipedia.org/wiki/Cluster_analysis',
						introduction:`<b>Cluster analysis</b> Cluster analysis is the task of grouping a set of objects (for example, words or topics) 
						in such a way that objects in the same group or cluster are more similar to each other than to those in other groups.`},
			{name: 'Network Analysis', url:'networkx', imgURL:'bootstrap/img/logo/networkX-logo.png',
						wiki:"https://en.wikipedia.org/wiki/Social_network_analysis",
						introduction:`<b>Social network analysis</b> is the process of investigating social 
						structures through the use of <a href="https://en.wikipedia.org/wiki/Network_theory">networks</a> and <a href="https://en.wikipedia.org/wiki/Graph_theory">graph theory
						</a>.It characterizes networked structures in terms of <i>nodes</i> (individual actors, people, or things within the network) and the <i>ties</i>, <i>edges</i>, 
						or <i>links</i> (relationships or interactions) that connect them.`}]
                      });
});

module.exports = router;