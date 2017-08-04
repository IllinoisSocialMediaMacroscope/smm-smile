from urllib.request import urlopen
from bs4 import BeautifulSoup
from nltk.tokenize import sent_tokenize, wordpunct_tokenize,TweetTokenizer
from tokenizer import tokenizer
#https://github.com/erikavaris/tokenizer
from nltk.corpus import stopwords
from nltk import WordNetLemmatizer
from nltk import Text, FreqDist
from nltk import pos_tag_sents,pos_tag
from nltk import PorterStemmer
#from nltk.corpus import brown
#from nltk.tag import UnigramTagger
#from nltk.tag import StanfordNERTagger
#from nltk.tag import SennaTagger,SennaNERTagger,SennaChunkTagger
#from nltk.chunk import ne_chunk_sents
import uuid
import argparse
import csv
import plotly.graph_objs as go
from plotly import tools
from plotly.offline import plot
import plotly.figure_factory as ff
import pandas as pd
import collections
import re, string
import json
import os
from os.path import join, dirname
from dotenv import load_dotenv
import warnings
warnings.filterwarnings('ignore')

class Preprocess:

    def __init__(self,DIR,format, content,column, source='unspecified'):

            self.DIR = DIR
                
            if format == 'URL':
                html = urlopen(content).read()
                soup = BeautifulSoup(html, 'html.parser')

                # kill all script, and style elements
                for script in soup(["script", "style","h1","h2","h3",
                                    "h4","h5","a","span","label","button"]):
                    script.extract()    # rip it out

                # get text
                text = soup.get_text()
                # break into lines and remove leading and trailing space on each
                lines = (line.strip() for line in text.splitlines())
                # break multi-headlines into a line each
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                # drop blank lines
                self.text = '\n'.join(chunk for chunk in chunks if chunk)
                sentences = sent_tokenize(self.text)

            elif format == 'file':
                Array = []
                with open(content,'r',encoding="utf-8") as f:
                    reader = csv.reader(f)
                    try:
                        for row in reader:
                            Array.append(row)
                    except Exception as e:
                        print(e)
                
                df = pd.DataFrame(Array[1:],columns=Array[0]).dropna()
                #df = pd.read_csv(content,encoding="utf-8")
                sentences = df[column].astype('str').tolist()
                self.text = '\n'.join(df[column].astype('str').tolist())


            # save phrases
            
            # tokenize the sentence
            phrases = [] # unofficial way to do that!
            regex = re.compile('[%s%s]' % (string.punctuation,'|\"\',\t\n’”“'))
            for item in sentences:
                for i in regex.split(item):
                    if i != '' and i.isdigit() != True and len(i)>20:
                        phrases.append(i.lower())
            phrases.insert(0,'Phrase')
            fname_phrases = self.DIR + '/sentence.csv'
            with open(fname_phrases, "w", newline='') as f:
                for item in phrases:
                    try:
                        f.write("{}\n".format(item)) 
                    except UnicodeEncodeError:
                        pass
            print(fname_phrases)


            # tokenize the word
            if format == 'URL':
                self.tokens = [wordpunct_tokenize(t) for t in sentences]
            elif format == 'file':
                if source == 'twitter':
                    tknz = TweetTokenizer()
                elif source == 'reddit':
                    tknz = tokenizer.RedditTokenizer()
                self.tokens = [tknz.tokenize(t) for t in sentences]
                
           
            # nltk's stopwords are too weak
           
            with open(os.path.dirname(__file__)+'/stopwords_en.txt','r') as f:
                stopwords2 = f.read().split('\n')
                
            with open(os.path.dirname(__file__)+'/twitter-customized.txt','r') as f:
                stopwords3 = f.read().split(',')

            self.filtered_tokens_lower = []
            self.filtered_tokens = []
            for token in self.tokens:
                self.filtered_tokens.append([word for word in token if (word.lower() not in stopwords.words('english')) #nltk stopwords
                                             and (word.lower() not in stopwords2) # third party stopwors:https://sites.google.com/site/kevinbouge/stopwords-lists
                                             and (word.isdigit() == False)      # no numbers
                                             and (word.isalnum() == True )      # only english characters
                                             and (word.lower() not in stopwords3) ])  # twitter specific stopwordshttps://sites.google.com/site/iamgongwei/home/sw
                self.filtered_tokens_lower.append([word.lower() for word in token if (word.lower() not in stopwords.words('english'))
                                             and (word.lower() not in stopwords2)
                                             and (word.isdigit() == False)
                                             and (word.isalnum() == True )
                                             and (word.lower() not in stopwords3) ])

            fname_filtered = self.DIR + '/tokenized.csv'
            with open(fname_filtered, "w", newline='') as f:
                writer = csv.writer(f)
                try:
                    writer.writerows(self.filtered_tokens_lower)
                except UnicodeEncodeError:
                    pass
            print(fname_filtered)
            
            
          
    def stem_lematize(self,process):

        if process == 'lemmatization':
            wnl = WordNetLemmatizer()
            self.processed_tokens = []
            for tk in self.filtered_tokens_lower:
                self.processed_tokens.append([wnl.lemmatize(t) for t in tk])

            fname_processed = self.DIR + '/lemmatized.csv'
            with open(fname_processed, "w", newline='') as f:
                writer = csv.writer(f)
                try:
                    writer.writerows(self.processed_tokens)
                except UnicodeEncodeError:
                    pass
            print(fname_processed)

        elif process == 'stemming':
            porter = PorterStemmer()
            self.processed_tokens = []
            for tk in self.filtered_tokens_lower:
                self.processed_tokens.append([porter.stem(t) for t in tk])
                
            fname_processed = self.DIR + '/stemmed.csv'
            with open(fname_processed, "w", newline='') as f:
                writer = csv.writer(f)
                try:
                    writer.writerows(self.processed_tokens)
                except UnicodeEncodeError:
                    pass
            print(fname_processed)

        elif process == 'both':
            wnl = WordNetLemmatizer()
            porter = PorterStemmer()
            self.processed_tokens = []

            for tk in self.filtered_tokens_lower:
                self.processed_tokens.append([wnl.lemmatize(porter.stem(t)) for t in tk])

            fname_processed = self.DIR + '/lemmatized-stemmed.csv'
            with open(fname_processed, "w", newline='') as f:
                writer = csv.writer(f)
                try:
                    writer.writerows(self.processed_tokens)
                except UnicodeEncodeError:
                    pass
            print(fname_processed)

            

    def tagging(self,tagger):
        if tagger == 'posTag':
            self.pos_tagging()
        elif tagger == 'unigramTag':
            self.unigramTagging()
        elif tagger == 'senna_posTag':
            self.sennaPosTagging()
        elif tagger == 'senna_nerTag':
            self.sennaNerTagging()
        elif tagger == 'senna_chunkTag':
            self.sennaChunkTagging()
        elif tagger == 'stanford_nerTag':
            self.standfordNerTagging()

        fname_tagged = self.DIR + '/POStagged.csv'
        with open(fname_tagged, "w", newline='') as f:
            writer = csv.writer(f)
            try:
                writer.writerows(self.tag)
            except UnicodeEncodeError:
                pass
        print(fname_tagged)
            

    def pos_tagging(self):
        self.tag = []
        self.tag = pos_tag_sents(self.processed_tokens)

    '''def unigramTagging(self):
        self.tag = []
        tagger = UnigramTagger(brown.tagged_sents())
        for sent in self.processed_tokens:
            self.tag.append(tagger.tag(sent))

    def sennaPosTagging(self):
        self.tag = []
        tagger = SennaTagger('C:/Users/cwang138/bin/senna')
        for sent in self.processed_tokens:
            self.tag.append(tagger.tag(sent))

    def sennaNerTagging(self):
        self.tag = []
        tagger = SennaNERTagger('C:/Users/cwang138/bin/senna')
        for sent in self.processed_tokens:
            self.tag.append(tagger.tag(sent))

    def sennaChunkTagging(self):
        self.tag = []
        tagger = SennaChunkTagger('C:/Users/cwang138/bin/senna')
        for sent in self.processed_tokens:
            self.tag.append(tagger.tag(sent))

    def standfordNerTagging(self):
        self.tag = []
        tagger = StanfordNERTagger('C:/Users/cwang138/bin/english.all.3class.distsim.crf.ser.gz',
                                   'C:/Users/cwang138/bin/stanford-ner.jar')
        for sent in self.processed_tokens:
            self.tag.append(tagger.tag(sent))

    def nameEntityRecognition(self):
        #sentences = sent_tokenize(self.text)
        #tokenized_sentences = [word_tokenize(sentence) for sentence in sentences]
        tagged_sentences = pos_tag_sents(self.filtered_tokens)
        chunked_sentences = ne_chunk_sents(tagged_sentences, binary=True)
        
        def extract_entity_names(t):
            entity_names = []
            
            if hasattr(t, 'label') and t.label():
                if t.label() == 'NE':
                    entity_names.append(' '.join([child[0] for child in t]))
                else:
                    for child in t:
                        entity_names.extend(extract_entity_names(child))
                        
            return entity_names

        entity_names = []
        for tree in chunked_sentences:
            entity_names.extend(extract_entity_names(tree))
        
        self.counterEntities=collections.Counter(entity_names).most_common()
        self.counterEntities.insert(0,('Name Entitiy','Appear Frequency'))
        
        fname_NE = self.DIR + '/NameEntity.csv'
        with open(fname_NE, "w", newline='') as f:
            writer = csv.writer(f)
            try:
                writer.writerows(self.counterEntities)
            except UnicodeEncodeError:
                pass
        print(fname_NE)




    def plotNE(self):
        
        labels = []
        values = []

        # too many entities, only plot top 30
        for item in self.counterEntities[:30]:
            labels.append(item[0])
            values.append(item[1])
            
        trace = go.Pie(labels=labels,values = values,
                       textinfo='label',domain={'x':[0,0.9]})        
        # Plot!
        div_NE = plot([trace], output_type='div',image='png',auto_open=False, image_filename='plot_img')
        fname_div_NE = self.DIR + '/div_NE.dat'
        with open(fname_div_NE,"w") as f:
            f.write(div_NE)
        print(fname_div_NE)'''
        
            
    def plotFreq(self):

        filtered_document = []
        for sent_token in self.filtered_tokens:
            filtered_document += sent_token
        processed_document = []
        for sent_token in self.processed_tokens:
            processed_document += sent_token

        # use plotly instead
        filtered_most_common = FreqDist(filtered_document).most_common()
        fname_most_common = self.DIR + '/frequent-rank.csv'
        with open(fname_most_common, "w", newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['word','frequency'])
            try:
                writer.writerows(filtered_most_common)
            except UnicodeEncodeError:
                pass
        print(fname_most_common)
        
        processed_most_common = FreqDist(processed_document).most_common()

        # word frequency figure
        filtered_X = []
        filtered_y = []
        processed_X = []
        processed_y =[]

        for common in filtered_most_common[:25]:  
            filtered_X.append(common[0])
            filtered_y.append(common[1])
        for common in processed_most_common[:25]:  
            processed_X.append(common[0])
            processed_y.append(common[1])

        trace0 = go.Bar(x=filtered_X,
                        y=filtered_y,
                        marker=dict(color='rgba(200,75,73,1.0)',
                        line=dict(color='rgba(111,11,9,1.0)',
                                  width=1),
                        ),
                        name='tokenized words',
                        #orientation='h',
                    )
        trace1 = go.Bar(x=processed_X,
                        y=processed_y,
                        marker=dict(color='rgba(66,139,202,1.0)',
                        line=dict(color='rgba(1,52,97,1.0)',
                                  width=1),
                        ),
                        name='stemmed and (or) lemmatized words',
                        #orientation='h',
                    )
        layout = dict(
            title='Top 25 frequent words',
            font=dict(family='Arial',size=12),
            yaxis1=dict(
                showgrid=False,
                showline=True,
                showticklabels=True,
                linecolor='rgba(102, 102, 102, 0.8)',
                linewidth=2,
                domain=[0.15, 0.85],
            ),
            yaxis2=dict(
                showgrid=False,
                showline=True,
                showticklabels=True,
                linecolor='rgba(102, 102, 102, 0.8)',
                linewidth=2,
                domain=[0.15, 0.85],
            ),
           xaxis1=dict(
                zeroline=False,
                showline=False,
                showticklabels=True,
                showgrid=True,
                domain=[0, 0.45],
            ),
            xaxis2=dict(
                zeroline=False,
                showline=False,
                showticklabels=True,
                showgrid=True,
                domain=[0.55, 1],
            ),
            legend=dict(
                x=0.029,
                y=1.038,
                font=dict(
                 size=15,
            ),
        ),
            margin=dict(
                l=70,
                r=70,
                t=70,
                b=70,
            )
        )

        annotations=[]
        for x1,y1,x2,y2 in zip(filtered_X, filtered_y, processed_X, processed_y):
            annotations.append(dict(xref='x1',yref='y1',
                                    y=y1+2, x=x1,
                                    text=str(y1),
                                    font=dict(family='Arial',
                                    size=12,
                                    color='rgba(200,75,73,1.0)'),
                                    showarrow=False))
            annotations.append(dict(xref='x2',yref='y2',
                                    y=y2+2, x=x2,
                                    text=str(y2),
                                    font=dict(family='Arial',
                                    size=12,
                                    color='rgba(66,139,202,1.0)'),
                                    showarrow=False))

        layout['annotations'] = annotations
                                    

        fig = tools.make_subplots(rows=1, cols=2, specs=[[{}, {}]], shared_xaxes=True,
                          shared_yaxes=False, vertical_spacing=0.001,print_grid=False)
        fig.append_trace(trace0, 1, 1)
        fig.append_trace(trace1, 1, 2)
        fig['layout'].update(layout)
        
        div = plot(fig, output_type='div',image='png',auto_open=False, image_filename='plot_img')
        fname_div = self.DIR + '/div.dat'
        with open(fname_div,"w") as f:
            f.write(div)
        print(fname_div)
      


        
       

if __name__ =='__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--format', required=True)
    parser.add_argument('--source', required=False)
    parser.add_argument('--content',required=True)
    parser.add_argument('--process',required=True)
    parser.add_argument('--tagger', required=True)
    parser.add_argument('--column', required=False)

    args = parser.parse_args()

    #save arguments
   
    dotenv_path = join(dirname(__file__), '../../.env')
    load_dotenv(dotenv_path)
    
    uid = str(uuid.uuid4())
    DIR = os.environ.get('ROOTDIR') + os.environ.get('DOWNLOAD_NLP_PREPROCESSING') +'/' + uid
    if not os.path.exists(DIR):
        os.makedirs(DIR)

    fname = DIR + '/config.dat'
    with open(fname,"w") as f:
        json.dump(vars(args),f)
    print(fname)
                
    preprocessing = Preprocess(DIR,args.format,args.content,args.column,args.source)
    preprocessing.stem_lematize(args.process)
    preprocessing.plotFreq()
    preprocessing.tagging(args.tagger)    
    #preprocessing.nameEntityRecognition()
    #preprocessing.plotNE()
    

