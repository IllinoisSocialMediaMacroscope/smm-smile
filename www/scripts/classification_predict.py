import csv
import argparse
import os
from os.path import join, dirname
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.naive_bayes import MultinomialNB
from sklearn import metrics
import pickle
import numpy as np
from plotly.offline import plot
import plotly.graph_objs as go
from collections import Counter
import json
from helper_func import writeToS3 as s3
from helper_func import deleteDir

class Classification:

    def __init__(self, awsPath, localSavePath, unlabeled):

        self.localSavePath = localSavePath
        self.bucketName = 'macroscope-smile'
        self.awsPath = awsPath
        self.unlabeled = unlabeled

    def predict(self):

        # load classification model
        pkl_model = os.path.join(self.localSavePath,'classification_pipeline.pickle')
        with open(pkl_model,'rb') as f:
            text_clf = pickle.load(f)

        # load text set
        data = []
        try:
            with open(self.localSavePath + self.unlabeled,'r',encoding='utf-8') as f:
                reader = list(csv.reader(f))
                for row in reader[1:]:
                    try:
                        data.extend(row)
                    except Exception as e:
                        pass
        except:
            with open(self.localSavePath + self.unlabeled,'r',encoding='ISO-8859-1') as f:
                reader = list(csv.reader(f))
                for row in reader[1:]:
                    try:
                        data.extend(row)
                    except Exception as e:
                        pass

        # predict using trained model         
        self.predicted = text_clf.predict(data)

        # save result
        fname = 'PREDICTED_' + filename + '.csv'
        try:
            with open(self.localSavePath + fname,'w',newline="",encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['text','category'])
                for i in range(len(data)):
                    try:
                        writer.writerow([data[i],self.predicted[i]])
                    except:
                        pass
        except:
            with open(self.localSavePath + fname,'w',newline="",encoding='ISO-8859-1') as f:
                writer = csv.writer(f)
                writer.writerow(['text','category'])
                for i in range(len(data)):
                    try:
                        writer.writerow([data[i],self.predicted[i]])
                    except:
                        pass
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname)
        s3.generate_downloads(self.bucketName, self.awsPath, fname)
        

    def plot(self):
        y_pred_dict = Counter(self.predicted)
        labels = []
        values = []
        for i in y_pred_dict.keys():
            labels.append("class: " + str(i))
            values.append(y_pred_dict[i])
        trace = go.Pie(labels=labels, values = values, textinfo='label')
        div_comp = plot([trace], output_type='div',image='png',auto_open=False, image_filename='plot_img')

        fname_div_comp = 'div_comp.dat'
        with open(self.localSavePath + fname_div_comp,"w") as f:
            f.write(div_comp)
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname_div_comp)
        # s3.generate_downloads(self.bucketName, self.awsPath, fname_div_comp)
        print(self.localSavePath + fname_div_comp)

if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--uuid',required=True)
    parser.add_argument('--appPath', required=True)
    parser.add_argument('--sessionID', required=False)
    args = parser.parse_args()

    uid = args.uuid
    awsPath = args.sessionID + '/ML/classification/' + uid +'/'
    localSavePath = args.appPath + '/downloads/ML/classification/' + uid + '/'
    print(localSavePath)
    print(uid)

    if not os.path.exists(localSavePath):
        os.makedirs(localSavePath)

    # download config to that folder
    fname_config = 'config.dat'
    if s3.checkExist('macroscope-smile', awsPath, fname_config): 
        s3.downloadToDisk('macroscope-smile', fname_config, localSavePath, awsPath)
    else:
        deleteDir.deletedir(localSavePath)
        raise ValueError('You\'re requesting ' + fname_config + ' file, and it\'s not found in your remote directory!')

    # download unlabeled data to that folder
    with open(localSavePath + 'config.dat', 'r') as f:
        data = json.load(f)
        filename = data['filename']
    fname_unlabeled = 'UNLABELED_' + filename +'.csv'
    if s3.checkExist('macroscope-smile', awsPath, fname_unlabeled): 
        s3.downloadToDisk('macroscope-smile', fname_unlabeled, localSavePath, awsPath)
    else:
        deleteDir.deletedir(localSavePath)
        raise ValueError('You\'re requesting ' + fname_unlabeled + ' file, and it\'s not found in your remote directory!')

    #download pickle model
    fname_pickle = 'classification_pipeline.pickle'
    if s3.checkExist('macroscope-smile', awsPath, fname_pickle): 
        s3.downloadToDisk('macroscope-smile', fname_pickle, localSavePath, awsPath)
    else:
        deleteDir.deletedir(localSavePath)
        raise ValueError('You\'re requesting ' + fname_pickle + ' file, and it\'s not found in your remote directory!')

    
    classification = Classification(awsPath, localSavePath, 'UNLABELED_' + filename +'.csv')
    classification.predict()
    classification.plot()
