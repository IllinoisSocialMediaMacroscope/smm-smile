from urllib.request import urlopen
from bs4 import BeautifulSoup
from nltk.tokenize import sent_tokenize, wordpunct_tokenize
from nltk.sentiment.vader import SentimentIntensityAnalyzer,allcap_differential,negated
import numpy as np
import uuid
import argparse
import csv
import plotly.graph_objs as go
from plotly import tools
from plotly.offline import download_plotlyjs, init_notebook_mode, plot, iplot
import pandas as pd
import json
import os
from os.path import join, dirname
from dotenv import load_dotenv
import warnings
warnings.filterwarnings('ignore')

class Sentiment:
    sid = SentimentIntensityAnalyzer()
    
    def __init__(self,DIR,format,content,column=''):

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
                self.sent = sent_tokenize(self.text)

            elif format == 'file':
                Array = []
                with open(content,'r',encoding="utf-8") as f:
                    reader = csv.reader(f)
                    try:
                        for row in reader:
                            Array.append(row)
                    except Exception as e:
                        print(e)
                
                df = pd.DataFrame(Array[1:],columns=Array[0])
                #df = pd.read_csv(content,encoding="utf-8")
                self.sent = df[column].dropna().astype('str').tolist()
                self.text = ''.join(self.sent)
    
    def documentSentiment(self):
        scores = self.sid.polarity_scores(self.text)
        labels = ['negative', 'neutural', 'positive']
        values = [scores['neg'], scores['neu'], scores['pos']]
        trace = go.Pie(labels=labels,values=values,textinfo='label+percent')
        # Plot!
        div_sent = plot([trace], output_type='div',image='png',auto_open=False, image_filename='plot_img')
        fname_div_sent = self.DIR + '/div_sent.dat'
        with open(fname_div_sent,"w") as f:
            f.write(div_sent)
        print(fname_div_sent)
        
	# Save scores into json
        fname_doc = self.DIR + '/document.json'
        with open(fname_doc,"w") as f:
            json.dump(scores,f);
        print(fname_doc)
		
		
    def sentenceSentiment(self):
        self.result = [['sentence','negative','neutral','positive','compound']]
        for item in self.sent:
            scores = self.sid.polarity_scores(item)
            self.result.append([item.encode('utf-8','ignore'),scores['neg'],scores['neu'],scores['pos'],scores['compound']])

    def negated(self):
        self.negation_result = [['sentence','hasNegation']]
        for item in self.sent:
            self.negation_result.append([item.encode('utf-8','ignore'),negated(item)])

    def allcap(self):
        self.allcap_result = [['sentence','ALL CAPITAL']]
        for item in self.sent:
            self.allcap_result.append([item.encode('utf-8','ignore'),allcap_differential(item)])
                          
    def overview(self):
        # save to csv for download
        # save 
        fname = self.DIR + '/sentiment.csv'
        with open(fname, "w", newline='') as f:
            writer = csv.writer(f)
            try:
                writer.writerows(self.result)
            except UnicodeEncodeError:
                pass
        print(fname)

        fname = self.DIR + '/negation.csv'
        with open(fname, "w", newline='') as f:
            writer = csv.writer(f)
            try:
                writer.writerows(self.negation_result)
            except UnicodeEncodeError:
                pass
        print(fname)

        fname = self.DIR + '/allcap.csv'
        with open(fname, "w", newline='') as f:
            writer = csv.writer(f)
            try:
                writer.writerows(self.allcap_result)
            except UnicodeEncodeError:
                pass
        print(fname)



        # preview 25 lines of data
        for i,item in enumerate(self.result):
            if i <= 25:
                print(item[0],'\t',
                      item[1],'\t',
                      item[2],'\t',
                      item[3],'\t',
                      item[4],'\t')

        if len(self.result)<25:
            for i in range(25-len(self.result)+1):
                print('NUll','NULL','NULL','NULL','NULL')
        
                               

if __name__ =='__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--format', required=True)
    parser.add_argument('--content',required=True)
    parser.add_argument('--column', required=False)

    args = parser.parse_args()

    #save arguments
    dotenv_path = join(dirname(__file__), '../../.env')
    load_dotenv(dotenv_path)
    
    uid = str(uuid.uuid4())
    DIR = os.environ.get('ROOTDIR') + os.environ.get('DOWNLOAD_NLP_SENTIMENT') +'/' + uid
    if not os.path.exists(DIR):
        os.makedirs(DIR)

    fname = DIR + '/config.dat'
    with open(fname,"w") as f:
        json.dump(vars(args),f)
    print(fname)

    sentiment = Sentiment(DIR, args.format,args.content,args.column)
    sentiment.documentSentiment()
    sentiment.sentenceSentiment()
    sentiment.negated()
    sentiment.allcap()
    sentiment.overview()
    

