var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	res.render('index',{ 
		pages:[
			/*{name:'search',url:'/query',imgURL:'../bootstrap/img/logo/search-logo.svg',
						introduction:`placeholder`
			},*/
			{name:'Pre-processing',url:'/NLP/preprocess', imgURL:'../bootstrap/img/logo/NLP/NLP-preprocess.png',
						introduction:`<a href="https://en.wikipedia.org/wiki/Text_segmentation#Word_segmentation"><b>Tokenization</b></a>
						 is the process of dividing written text into meaningful units, such as words, <a href="https://en.wikipedia.org/wiki/Sentence_(linguistics)">sentences
						</a>, or <a href="https://en.wikipedia.org/wiki/Topic_(linguistics)" title="Topic (linguistics)">topics</a>.<br><br>
						
						<a href="https://nlp.stanford.edu/IR-book/html/htmledition/stemming-and-lemmatization-1.html"><b>Lemmatization and Stemming :</b></a>
						For grammatical reasons, documents are going to use different forms of a word, such as <I>"organize"</I>, <I>"organizes"</I>, and <I>"organizing"</I>.  
						Additionally, there are families of derivationally related words with similar meanings, such as <I>"democracy"</I>, <I>"democratic"</I>, and <I>"democratization"</I>.
						The goal of both stemming and lemmatization is to reduce inflectional forms and sometimes derivationally related forms of a word to a common base form.<br><br>
						
						<a href="https://en.wikipedia.org/wiki/Part-of-speech_tagging"><b>Part-of-speech Tagging</b></a> is the process of marking up a word in a text (corpus) as corresponding to a particular 
						<a href="https://en.wikipedia.org/wiki/Parts_of_speech">part of speech</a>, based on both 
						its definition and its context. A simplified form of this is commonly taught to school-age children, in the identification of 
						words as <a href="https://en.wikipedia.org/wiki/Noun">nouns</a>, <a href="https://en.wikipedia.org/wiki/Verb">verbs</a>, 
						<a href="https://en.wikipedia.org/wiki/Adjective">adjectives</a>, <a href="https://en.wikipedia.org/wiki/Adverb">adverbs</a>, etc.<br><br>`},
            {name:'Sentiment Analysis', url:'/NLP/sentiment', imgURL:'../bootstrap/img/logo/NLP/SA.png',
						
						introduction:`<a href="https://en.wikipedia.org/wiki/Sentiment_analysis"><b>Sentiment analysis</b></a> (sometimes known as opinion mining or emotion AI) refers to the
						use of <a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Natural_language_processing">
						natural language processing</a>, <a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Text_analytics" >text analysis</a>, 
						<a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Computational_linguistics">computational linguistics</a>, and 
						<a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Biometrics">biometrics</a> to systematically identify, extract, 
						quantify, and study affective states and subjective information.<br><br>

						<a href="http://comp.social.gatech.edu/papers/icwsm14.vader.hutto.pdf"><b>VADER sentiment analysis</b></a>
						is a simple <a href="https://en.wikipedia.org/wiki/Rule-based_system">rule-based model</a> for general sentiment analysis. Using a 
						combination of qualitative and quantitative methods, VADER first construct and empirically validate a 
						goldstandard list of <a href="https://en.wikipedia.org/wiki/Lexical_semantics">lexical features</a>
						(along with their associated sentiment intensity measures) which are specifically attuned to sentiment in 
						<a href="https://en.wikipedia.org/wiki/Microblogging">microblog-like contexts</a>. It then combines these lexical features with consideration for five general rules that embody grammatical and syntactical 
						conventions for expressing and emphasizing sentiment intensity. `},
			{name:'Topic Modeling', url:'/NLP/topic', imgURL:'../bootstrap/img/logo/NLP/topic-model.png',
						
						introduction:`In <a href="https://en.wikipedia.org/wiki/Machine_learning">machine learning</a> and <a href="https://en.wikipedia.org/wiki/Natural_language_processing">natural language processing</a>, 
						a <a href="https://en.wikipedia.org/wiki/Topic_model"><b>topic model</b></a> is a type of <a href="https://en.wikipedia.org/wiki/Statistical_model">statistical model</a> 
						for discovering the abstract "topics" that occur in a collection of documents. Topic modeling is a frequently used text-mining 
						tool for discovery of hidden semantic structures in a text body. Intuitively, given that a document is about a particular topic, 
						one would expect particular words to appear in the document more or less frequently: "dog" and "bone" will appear more often in documents about dogs,
						"cat" and "meow" will appear in documents about cats, and "the" and "is" will appear equally in both. A document typically concerns multiple topics 
						in different proportions; thus, in a document that is 10% about cats and 90% about dogs, there would probably be about 9 times more dog words than cat words. 
						The "topics" produced by topic modeling techniques are clusters of similar words.<br><br>`},
			{name: 'Clustering', url:'/sklearn/cluster', imgURL:'../bootstrap/img/logo/sklearn/clustering.png',
						introduction:`<a href="https://en.wikipedia.org/wiki/Cluster_analysis"><b>Cluster analysis</b></a> is the task of grouping a set of objects in such a 
						way that objects in the same group (called a <b>cluster</b>) are more similar (in some sense or another) to each 
						other than to those in other groups (clusters). It is a main task of exploratory <a href="https://en.wikipedia.org/wiki/Data_mining" title="Data mining">data mining</a>,
						and a common technique for <a href="https://en.wikipedia.org/wiki/Statistics" title="Statistics">statistical</a> <a href="https://en.wikipedia.org/wiki/Data_analysis" title="Data analysis">
						data analysis</a>, used in many fields, including <a href="https://en.wikipedia.org/wiki/Machine_learning" title="Machine learning">machine learning</a>,
						<a href="https://en.wikipedia.org/wiki/Pattern_recognition" title="Pattern recognition">pattern recognition</a>, <a href="https://en.wikipedia.org/wiki/Image_analysis" title="Image analysis">
						image analysis</a>, <a href="https://en.wikipedia.org/wiki/Information_retrieval" title="Information retrieval">information retrieval</a>, <a href="https://en.wikipedia.org/wiki/Bioinformatics"
						title="Bioinformatics">bioinformatics</a>, <a href="https://en.wikipedia.org/wiki/Data_compression" title="Data compression">data compression</a>, 
						and <a href="https://en.wikipedia.org/wiki/Computer_graphics" title="Computer graphics">computer graphics</a>.Cluster analysis itself is not one specific <a href="https://en.wikipedia.org/wiki/Algorithm" title="Algorithm">algorithm</a>, but the general task to be solved. 
						`},
			{name: 'Network Analysis', url:'/networkx', imgURL:'../bootstrap/img/logo/networkX-logo.png',
						introduction:`<a href="https://en.wikipedia.org/wiki/Social_network_analysis"><b>Social network analysis</b></a>is the process of investigating social 
						structures through the use of <a href="https://en.wikipedia.org/wiki/Network_theory">networks</a> and <a href="https://en.wikipedia.org/wiki/Graph_theory">graph theory
						</a>.It characterizes networked structures in terms of <i>nodes</i> (individual actors, people, or things within the network) and the <i>ties</i>, <i>edges</i>, 
						or <i>links</i> (relationships or interactions) that connect them. Examples of social structures commonly visualized through social network analysis include 
						<a href="https://en.wikipedia.org/wiki/Social_media">social media networks</a>,<a href="https://en.wikipedia.org/wiki/Internet_meme" title="Internet meme">memes</a> spread,
						<a href="https://en.wikipedia.org/wiki/Weak_ties" class="mw-redirect">friendship and acquaintance networks</a>, 
						<a href="https://en.wikipedia.org/wiki/Collaboration_graph">collaboration graphs</a>, <a href="https://en.wikipedia.org/wiki/Kinship">kinship</a>,
						<a href="https://en.wikipedia.org/wiki/Disease_transmission">disease transmission</a> and so on.<br><br>
						<a href="https://networkx.github.io/"><b>NetworkX</b></a> is a Python package for the creation, manipulation, and study of the structure, dynamics, and functions of complex networks.The 
						potential audience for NetworkX includes mathematicians, physicists, biologists, computer scientists, and social scientists. Good reviews of 
						the state-of-the-art in the science of complex networks are presented in <a href="https://arxiv.org/abs/cond-mat/0106096">Albert and Barabási</a>, 
						<a href="http://epubs.siam.org/doi/abs/10.1137/S003614450342480">Newman</a>, and <a href="https://arxiv.org/abs/cond-mat/0106144">Dorogovtsev and Mendes</a>. 
						For basic graph algorithms,we recommend the texts of <a href="http://dl.acm.org/citation.cfm?id=523106">Sedgewick</a>, and the survey of <a href="http://www.springer.com/us/book/9783540249795">
						Brandes and Erlebach</a>.`}]
                      });
});

module.exports = router;