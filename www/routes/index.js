var express = require('express');
var router = express.Router();


router.get('/',function(req,res,next){
	
	res.render('index',{ 
		pages:[
			{
				name:'Searching Social Media',
				url:'query',
				imgURL:'bootstrap/img/logo/search-smm.png',
				wiki:'https://en.wikipedia.org/wiki/Social_search',
				introduction: `SMILE empowers researchers to search content from multiple social media platforms all at once. 
					Find tweets, individual user accounts, and comments that match specific criteria, 
					and analyze content with just a few clicks. Both live and historical data are available for search.`
			},
			{
				name:'Pre-processing',
				url:'NLP-preprocess',
				imgURL:'bootstrap/img/logo/NLP/NLP-preprocess.png',
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
            {
            	name: 'Text Classification',
				url:'text-classification',
				imgURL:'bootstrap/img/logo/sklearn-logo.png',
				wiki:"https://nlp.stanford.edu/IR-book/html/htmledition/text-classification-and-naive-bayes-1.html",
				introduction:`Text classification is one of the important and typical task in supervised machine learning (ML). 
					Text Classification assigns one or more classes to a document according to their content. Classes are selected from 
					a previously established taxonomy (catergories or classes), which are usually established by human hand labeling.`},
			{
				name:'Sentiment Analysis',
				url:'NLP-sentiment',
				imgURL:'bootstrap/img/logo/NLP/SA.png',
				wiki:'https://en.wikipedia.org/wiki/Sentiment_analysis',
				introduction:`<b>Sentiment analysis</b> (sometimes known as opinion mining or emotion AI) refers to the
					use of <a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Natural_language_processing">
					natural language processing</a>, <a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Text_analytics" >text analysis</a>, 
					<a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Computational_linguistics">computational linguistics</a>, and 
					<a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Biometrics">biometrics</a> to systematically identify, extract, 
					quantify, and study affective states and subjective information.`},
			{
				name: 'Network Analysis',
				url:'networkx',
				imgURL:'bootstrap/img/logo/networkX-logo.png',
				wiki:"https://en.wikipedia.org/wiki/Social_network_analysis",
				introduction:`<b>Social network analysis</b> is the process of investigating social 
					structures through the use of <a href="https://en.wikipedia.org/wiki/Network_theory">networks</a> and <a href="https://en.wikipedia.org/wiki/Graph_theory">graph theory
					</a>.It characterizes networked structures in terms of <i>nodes</i> (individual actors, people, or things within the network) and the <i>ties</i>, <i>edges</i>, 
					or <i>links</i> (relationships or interactions) that connect them.`},
            {
                name:'Clowder',
                url:'',
                imgURL:'bootstrap/img/logo/clowder-only-logo.png',
                wiki:'https://clowder.ncsa.illinois.edu',
                introduction:`Clowder is a research data management system. You can choose to add search results 
					and analytics outputs to Clowder within SMILE. A cluster of extraction services will process the 
					data to extract interesting metadata and create web based data previews and visualizations.`
            }]
		});
});

module.exports = router;
