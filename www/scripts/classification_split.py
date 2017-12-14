import csv
import pandas
import random
import argparse
import uuid
import os
from plotly.offline import plot
import plotly.graph_objs as go
from os.path import join, dirname
import json
import re
from helper_func import writeToS3 as s3
from helper_func import deleteDir

class Classification:

    def __init__(self,awsPath, localSavePath, localReadPath):

        self.localSavePath = localSavePath
        self.bucketName = 'socialmediamacroscope-smile'
        self.awsPath = awsPath

        Array = []
        try:
            with open(localReadPath,'r',encoding='utf-8') as f:
                reader = csv.reader(f)
                for row in reader:
                    try:
                        Array.append(row)
                    except Exception as e:
                        pass
        except:
            with open(localReadPath,'r',encoding='ISO-8859-1') as f:
                reader = csv.reader(f)
                for row in reader:
                    try:
                        Array.append(row)
                    except Exception as e:
                        pass

        df = pandas.DataFrame(Array[1:], columns=Array[0])
        # find the unique tweet in a corpus
        if 'text' in Array[0]:
            self.corpus = list(set(df['text'].dropna().astype('str').tolist()))
        elif '_source.text' in Array[0]:
            self.corpus = list(set(df['_source.text'].dropna().astype('str').tolist()))
        # find the unique title in reddit
        elif 'title' in Array[0]:
            self.corpus = list(set(df['title'].dropna().astype('str').tolist()))
        elif '_source.title' in Array[0]:
            self.corpus = list(set(df['_source.title'].dropna().astype('str').tolist()))
        elif 'body' in Array[0]:
            self.corpus = list(set(df['body'].dropna().astype('str').tolist()))
        elif '_source.body' in Array[0]:
            self.corpus = list(set(df['_source.body'].dropna().astype('str').tolist()))
            
        # strip http in the corpus
        self.corpus = [ re.sub(r"http\S+","",text) for text in self.corpus]

    def split(self,ratio,filename):
        training_set = list(random.sample(self.corpus, int(len(self.corpus)*ratio/100)))
        testing_set = [item for item in self.corpus if item not in training_set]

        # plot a pie chart of the split
        labels = ['training set data points','unlabeled data points']
        values = [len(training_set), len(testing_set)]
        trace = go.Pie(labels=labels, values = values, textinfo='value')
        div_split = plot([trace], output_type='div',image='png',auto_open=False, image_filename='plot_img')
        fname_div_split = 'div_split.dat'
        with open(self.localSavePath + fname_div_split,"w") as f:
            f.write(div_split)
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname_div_split)
        # s3.generate_downloads(self.bucketName, self.awsPath, fname_div_split)
        print(self.localSavePath + fname_div_split)

        
        fname1 = 'TRAINING_' + filename  + '.csv'
        try:
            with open(self.localSavePath + fname1,'w',newline="",encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['text','category'])
                for row in training_set:
                    try:
                        writer.writerow([row])
                    except UnicodeDecodeError:
                        pass
        except:
            with open(self.localSavePath + fname1,'w',newline="",encoding='ISO-8859-1') as f:
                writer = csv.writer(f)
                writer.writerow(['text','category'])
                for row in training_set:
                    try:
                        writer.writerow([row])
                    except UnicodeDecodeError:
                        pass
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname1)
        s3.generate_downloads(self.bucketName, self.awsPath, fname1)



        fname2 = 'UNLABELED_' + filename +'.csv'
        try:
            with open(self.localSavePath + fname2,'w',newline="",encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['text'])
                for row in testing_set:
                    try:
                        writer.writerow([row])
                    except UnicodeDecodeError:
                        pass
        except:
            with open(self.localSavePath + fname2,'w',newline="",encoding='ISO-8859-1') as f:
                writer = csv.writer(f)
                writer.writerow(['text'])
                for row in testing_set:
                    try:
                        writer.writerow([row])
                    except UnicodeDecodeError:
                        pass
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname2)
        s3.generate_downloads(self.bucketName, self.awsPath, fname2)


        


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--appPath', required=True)
    parser.add_argument('--localReadPath', required=True)
    parser.add_argument('--ratio',required=True)
    parser.add_argument('--filename',required=True)
    parser.add_argument('--sessionID', required=False)
    args = parser.parse_args()
       
    uid = str(uuid.uuid4())
    awsPath = args.sessionID + '/ML/classification/' + uid +'/'
    localSavePath = args.appPath + '/downloads/ML/classification/' + uid + '/'
    
    if not os.path.exists(localSavePath):
        os.makedirs(localSavePath)
    fname = 'config.dat'
    with open(localSavePath + fname,"w") as f:
        json.dump(vars(args),f)
    s3.upload(localSavePath,'socialmediamacroscope-smile' , awsPath, fname)

    print(localSavePath)
    print(uid)


   
    classification = Classification(awsPath, localSavePath, args.localReadPath)
    classification.split(int(args.ratio),args.filename)

    # clean up local folders
    # deleteDir.deletedir(localSavePath)
        
