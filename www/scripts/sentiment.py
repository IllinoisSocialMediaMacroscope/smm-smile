import nltk
nltk.data.path.append('/apps/smiletest/nltk_data/')
from nltk.tokenize import sent_tokenize, wordpunct_tokenize
from nltk.sentiment.vader import SentimentIntensityAnalyzer,allcap_differential,negated
import uuid
import argparse
import csv
import plotly.graph_objs as go
from plotly import tools
from plotly.offline import plot
import pandas as pd
import json
import os
from os.path import join, dirname
from helper_func import writeToS3 as s3
from helper_func import deleteDir

class Sentiment:
    sid = SentimentIntensityAnalyzer()
    
    def __init__(self, awsPath, localSavePath, localReadPath, column=''):

            self.localSavePath = localSavePath
            self.bucketName = 'socialmediamacroscope-smile'
            self.awsPath = awsPath
            
           
            Array = []
            try:
                with open(localReadPath,'r',encoding="utf-8") as f:
                    reader = csv.reader(f)
                    try:
                        for row in reader:
                            Array.append(row)
                    except Exception as e:
                        pass
            except:
                with open(localReadPath,'r',encoding="ISO-8859-1") as f:
                    reader = csv.reader(f)
                    try:
                        for row in reader:
                            Array.append(row)
                    except Exception as e:
                        pass
                    
            df = pd.DataFrame(Array[1:],columns=Array[0])
            self.sent = df[column].dropna().astype('str').tolist()
            self.text = ''.join(self.sent)
    
    def documentSentiment(self):
        scores = self.sid.polarity_scores(self.text)
        labels = ['negative', 'neutral', 'positive']
        values = [scores['neg'], scores['neu'], scores['pos']]
        trace = go.Pie(labels=labels,values=values,textinfo='label+percent')
        
        div_sent = plot([trace], output_type='div',image='png',auto_open=False, image_filename='plot_img')
        fname_div_sent = 'div_sent.dat'
        with open(self.localSavePath + fname_div_sent,"w") as f:
            f.write(div_sent)
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname_div_sent)
        # s3.generate_downloads(self.bucketName, self.awsPath, fname_div_sent)
        # upload and then download then render takes too long
        # should render this from local directory
        print(self.localSavePath + fname_div_sent)
        
        
	# Save scores into json
        fname_doc = 'document.json'
        with open(self.localSavePath + fname_doc,"w") as f:
            json.dump(scores,f);
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname_doc)
        s3.generate_downloads(self.bucketName, self.awsPath, fname_doc)
		
		
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
        fname = 'sentiment.csv'
        try:
            with open(self.localSavePath + fname, "w", newline='',encoding='utf-8') as f:
                writer = csv.writer(f)
                try:
                    writer.writerows(self.result)
                except UnicodeEncodeError:
                    pass
        except:
            with open(self.localSavePath + fname, "w", newline='',encoding='ISO-8859-1') as f:
                writer = csv.writer(f)
                try:
                    writer.writerows(self.result)
                except UnicodeEncodeError:
                    pass
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname)
        s3.generate_downloads(self.bucketName, self.awsPath, fname)


        fname_negation = 'negation.csv'
        try:
            with open(self.localSavePath + fname_negation, "w", newline='',encoding='utf-8') as f:
                writer = csv.writer(f)
                try:
                    writer.writerows(self.negation_result)
                except UnicodeEncodeError:
                    pass
        except:
            with open(self.localSavePath + fname_negation, "w", newline='',encoding='ISO-8859-1') as f:
                writer = csv.writer(f)
                try:
                    writer.writerows(self.negation_result)
                except UnicodeEncodeError:
                    pass
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname_negation)
        s3.generate_downloads(self.bucketName, self.awsPath, fname_negation)


        fname_allcap = 'allcap.csv'
        try:
            with open(self.localSavePath + fname_allcap, "w", newline='',encoding='utf-8') as f:
                writer = csv.writer(f)
                try:
                    writer.writerows(self.allcap_result)
                except UnicodeEncodeError:
                    pass
        except:
            with open(self.localSavePath + fname_allcap, "w", newline='',encoding='ISO-8859-1') as f:
                writer = csv.writer(f)
                try:
                    writer.writerows(self.allcap_result)
                except UnicodeEncodeError:
                    pass
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname_allcap)
        s3.generate_downloads(self.bucketName, self.awsPath, fname_allcap)

        


if __name__ =='__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--appPath', required=True)
    parser.add_argument('--localReadPath',required=True)
    parser.add_argument('--column', required=False)
    parser.add_argument('--sessionID', required=False)
    args = parser.parse_args()

    uid = str(uuid.uuid4())
    awsPath = args.sessionID + '/NLP/sentiment/' + uid +'/'
    localSavePath = args.appPath + '/downloads/NLP/sentiment/' + uid + '/'
       
    if not os.path.exists(localSavePath):
        os.makedirs(localSavePath)
    fname = 'config.dat'
    with open(localSavePath + fname,"w") as f:
        json.dump(vars(args),f)
    s3.upload(localSavePath,'socialmediamacroscope-smile', awsPath, fname)
    # s3.generate_downloads('socialmediamacroscope-smile', awsPath, fname)
    print(localSavePath)

    sentiment = Sentiment(awsPath, localSavePath, args.localReadPath, args.column)
    sentiment.documentSentiment()
    sentiment.sentenceSentiment()
    sentiment.negated()
    sentiment.allcap()
    sentiment.overview()
    
    # clean up local folders
    # deleteDir.deletedir(localSavePath)
