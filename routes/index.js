var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
	res.render('index',{ 
		pages:[
			{name:'pre-processing',url:'/NLP/preprocess', imgURL:'../bootstrap/img/logo/NLP/NLP-preprocess.png',
						introduction:`<a href="https://en.wikipedia.org/wiki/Text_segmentation#Word_segmentation"><b>step1 - tokenization:</b></a>
						This is the process of dividing written text into meaningful units, such as words, <a href="https://en.wikipedia.org/wiki/Sentence_(linguistics)">sentences
						</a>, or <a href="https://en.wikipedia.org/wiki/Topic_(linguistics)" title="Topic (linguistics)">topics</a>. 
						The term applies to artificial processes implemented in computers, which are the 
						subject of <a href="https://en.wikipedia.org/wiki/Natural_language_processing">natural 
						language processing</a>.<br><br>
						
						<a href="https://nlp.stanford.edu/IR-book/html/htmledition/stemming-and-lemmatization-1.html"><b>step2 - lemmatization and stemming:</b></a>
						For grammatical reasons, documents are going to use different forms of a word, such as <I>"organize"</I>, <I>"organizes"</I>, and <I>"organizing"</I>.  
Additionally, there are families of derivationally related words with similar meanings, such as <I>"democracy"</I>, <I>"democratic"</I>, and <I>"democratization"</I>. The goal of both stemming and lemmatization is to reduce inflectional
forms and sometimes derivationally related forms of a word to a common base form.  For instance: <br> <u>am, are, is => be</u> <BR>	<u>car, cars, car's, cars' => car</u> <br><br>
						
						<a href="https://en.wikipedia.org/wiki/Part-of-speech_tagging"><b>step3 - tagging:</b></a>
						In <a href="https://en.wikipedia.org/wiki/Corpus_linguistics">corpus linguistics</a>, part-of-speech 
						tagging (POS tagging or POST), also called <a href="/wiki/Grammar">grammatical
						</a> tagging or <a href="https://en.wikipedia.org/wiki/Lexical_category" >word-category</a> 
						disambiguation, is the process of marking up a word in a text (corpus) as corresponding to a particular 
						<a href="https://en.wikipedia.org/wiki/Parts_of_speech">part of speech</a>, based on both 
						its definition and its context. A simplified form of this is commonly taught to school-age children, in the identification of 
						words as <a href="https://en.wikipedia.org/wiki/Noun">nouns</a>, <a href="https://en.wikipedia.org/wiki/Verb">verbs</a>, 
						<a href="https://en.wikipedia.org/wiki/Adjective">adjectives</a>, <a href="https://en.wikipedia.org/wiki/Adverb">adverbs</a>, etc.<br><br>
						
						<a href="https://en.wikipedia.org/wiki/Named-entity_recognition"><b>step4 - name entity recognization</b></a>
						Named-entity recognition(NER) (also known as entity identification, entity chunking and entity extraction) is a subtask 
						of <a href="https://en.wikipedia.org/wiki/Information_extraction">information extraction</a> that seeks to locate and 
						classify <a href="https://en.wikipedia.org/wiki/Named_entity">named entities</a> in text into pre-defined categories such as the
						names of persons, organizations, locations, expressions of times, quantities, monetary values, percentages, etc.
						`},
            {name:'sentiment analysis', url:'/NLP/sentiment', imgURL:'../bootstrap/img/logo/NLP/SA.png',
						
						introduction:`<a href="https://en.wikipedia.org/wiki/Sentiment_analysis"><b>Sentiment analysis</b></a> (sometimes known as opinion mining or emotion AI) refers to the
						use of <a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Natural_language_processing">
						natural language processing</a>, <a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Text_analytics" >text analysis</a>, 
						<a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Computational_linguistics">computational linguistics</a>, and 
						<a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Biometrics">biometrics</a> to systematically identify, extract, 
						quantify, and study affective states and subjective information. Sentiment analysis is widely applied to 
						<a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Voice_of_the_customer">
						voice of the customer</a> materials such as reviews and survey responses, online and social media, and healthcare materials for applications that range from 
						<a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Marketing">marketing</a> to 
						<a href="https://en.wikipedia.org/wiki/Sentiment_analysis/wiki/Customer_relationship_management">
						customer service</a>to clinical medicine.<br><br>

						<a href="http://comp.social.gatech.edu/papers/icwsm14.vader.hutto.pdf"><b>VADER sentiment analysis</b></a>
						is a simple <a href="https://en.wikipedia.org/wiki/Rule-based_system">rule-based model</a> for general sentiment analysis, 
						and compare its effectiveness to eleven typical state-of-practice benchmarks including <a href="http://liwc.wpengine.com/">LIWC</a>, 
						<a href="http://csea.phhp.ufl.edu/media/anewmessage.html">ANEW</a>, the <a href="http://www.wjh.harvard.edu/~inquirer/">General Inquirer</a>, 
						<a href="http://sentiwordnet.isti.cnr.it/">SentiWordNet</a>, and machine learning oriented techniques relying on Naive Bayes, Maximum Entropy, 
						and Support Vector Machine (SVM) algorithms.Using a combination of qualitative and quantitative methods, we first construct and empirically validate a 
						goldstandard list of lexical features (along with their associated sentiment intensity measures) which are specifically attuned to sentiment in 
						microblog-like contexts. We then combine these lexical features with consideration for five general rules that embody grammatical and syntactical conventions for expressing and emphasizing sentiment intensity. `},
			{name:'topic modeling', url:'/NLP/topic', imgURL:'../bootstrap/img/logo/NLP/topic-model.png',
						
						introduction:`In <a href="https://en.wikipedia.org/wiki/Machine_learning">machine learning</a> and <a href="https://en.wikipedia.org/wiki/Natural_language_processing">natural language processing</a>, 
						a <a href="https://en.wikipedia.org/wiki/Topic_model"><b>topic model</b></a> is a type of <a href="https://en.wikipedia.org/wiki/Statistical_model">statistical model</a> 
						for discovering the abstract "topics" that occur in a collection of documents. Topic modeling is a frequently used text-mining 
						tool for discovery of hidden semantic structures in a text body. Intuitively, given that a document is about a particular topic, 
						one would expect particular words to appear in the document more or less frequently: "dog" and "bone" will appear more often in documents about dogs,
						"cat" and "meow" will appear in documents about cats, and "the" and "is" will appear equally in both. A document typically concerns multiple topics 
						in different proportions; thus, in a document that is 10% about cats and 90% about dogs, there would probably be about 9 times more dog words than cat words. 
						The "topics" produced by topic modeling techniques are clusters of similar words.<br><br>
						In natural language processing, <a href="https://en.wikipedia.org/wiki/Latent_Dirichlet_allocation"><b>latent Dirichlet allocation (LDA)</b></a> 
						is a <a href="https://en.wikipedia.org/wiki/Generative_model">generative statistical 
						model</a> that allows sets of observations to be explained by <a href="https://en.wikipedia.org/wiki/Latent_variable">unobserved</a> groups that 
						explain why some parts of the data are similar. For example, if observations are words collected into documents, it posits that each document is 
						a mixture of a small number of topics and that each word's creation is attributable to one of the document's topics. LDA is an example of a
						<a href="https://en.wikipedia.org/wiki/Topic_model">topic model</a> and was first presented as a <a href="https://en.wikipedia.org/wiki/Graphical_models">graphical model</a> 
						for topic discovery by <a href="https://en.wikipedia.org/wiki/David_Blei">David Blei</a>,
						<a href="https://en.wikipedia.org/wiki/Andrew_Ng">Andrew Ng</a>, and <a href="https://en.wikipedia.org/wiki/Michael_I._Jordan">Michael
						I. Jordan</a> in 2003. Essentially 
						the same model was also proposed independently by <a href="https://en.wikipedia.org/wiki/Jonathan_K._Pritchard">J. K. Pritchard</a>,
						<a href="https://en.wikipedia.org/wiki/Matthew_Stephens_(statistician)">M. Stephens</a>, and <a href="https://en.wikipedia.org/wiki/Peter_Donnelly">P. Donnelly</a> 
						in the study of population genetics in 2000. Both papers have been highly influential, with 16488 and 18170 citations respectively
						by December 2016.`},
			{name: 'clustering', url:'/sklearn/cluster', imgURL:'../bootstrap/img/logo/sklearn/clustering.png',
						introduction:`<a href="https://en.wikipedia.org/wiki/Cluster_analysis"><b>Cluster analysis</b></a> or <b>clustering</b> is the task of grouping a set of objects in such a 
						way that objects in the same group (called a <b>cluster</b>) are more similar (in some sense or another) to each 
						other than to those in other groups (clusters). It is a main task of exploratory <a href="https://en.wikipedia.org/wiki/Data_mining" title="Data mining">data mining</a>,
						and a common technique for <a href="https://en.wikipedia.org/wiki/Statistics" title="Statistics">statistical</a> <a href="https://en.wikipedia.org/wiki/Data_analysis" title="Data analysis">
						data analysis</a>, used in many fields, including <a href="https://en.wikipedia.org/wiki/Machine_learning" title="Machine learning">machine learning</a>,
						<a href="https://en.wikipedia.org/wiki/Pattern_recognition" title="Pattern recognition">pattern recognition</a>, <a href="https://en.wikipedia.org/wiki/Image_analysis" title="Image analysis">
						image analysis</a>, <a href="https://en.wikipedia.org/wiki/Information_retrieval" title="Information retrieval">information retrieval</a>, <a href="https://en.wikipedia.org/wiki/Bioinformatics"
						title="Bioinformatics">bioinformatics</a>, <a href="https://en.wikipedia.org/wiki/Data_compression" title="Data compression">data compression</a>, 
						and <a href="https://en.wikipedia.org/wiki/Computer_graphics" title="Computer graphics">computer graphics</a>.<br>
						Cluster analysis itself is not one specific <a href="https://en.wikipedia.org/wiki/Algorithm" title="Algorithm">algorithm</a>, but the general task to be solved. 
						It can be achieved by various algorithms that differ significantly in their notion of what constitutes a cluster and how to efficiently find them. 
						Popular notions of clusters include groups with small <a href="https://en.wikipedia.org/wiki/Distance_function" class="mw-redirect" title="Distance function">distances</a>
						among the cluster members, dense areas of the data space, intervals or particular <a href="https://en.wikipedia.org/wiki/Statistical_distribution" class="mw-redirect"
						title="Statistical distribution">statistical distributions</a>. Clustering can therefore be formulated as a <a href="https://en.wikipedia.org/wiki/Multi-objective_optimization" 
						title="Multi-objective optimization">multi-objective optimization</a> problem. The appropriate clustering algorithm and parameter settings 
						(including values such as the <a href="https://en.wikipedia.org/wiki/Metric_(mathematics)" title="Metric (mathematics)">distance function</a> to use, a density threshold 
						or the number of expected clusters) depend on the individual data set and intended use of the results. Cluster analysis as such is not an automatic 
						task, but an iterative process of <a href="https://en.wikipedia.org/wiki/Knowledge_discovery" class="mw-redirect" title="Knowledge discovery">knowledge discovery</a> or 
						interactive multi-objective optimization that involves trial and failure. It is often necessary to modify data preprocessing and model parameters 
						until the result achieves the desired properties.`}]
                      });
});

module.exports = router;