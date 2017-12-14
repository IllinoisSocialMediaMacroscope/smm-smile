import csv
import argparse
import os
from os.path import join, dirname
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import Perceptron
from sklearn.linear_model import SGDClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import PassiveAggressiveClassifier
from sklearn import metrics
from sklearn.metrics import roc_curve, auc
from sklearn.preprocessing import label_binarize
from sklearn.model_selection import cross_val_predict
from sklearn.model_selection import cross_val_score
from scipy import interp
from itertools import cycle
import pickle
import numpy as np
from plotly.offline import plot
import plotly.graph_objs as go
import json
from helper_func import writeToS3 as s3
from helper_func import deleteDir



class Classification:

    def __init__(self, awsPath, localSavePath, file):

        self.localSavePath = localSavePath
        self.bucketName = 'socialmediamacroscope-smile'
        self.awsPath = awsPath
        
        Array = []
        try:
            with open(file,'r',encoding="utf-8") as f:
                reader = csv.reader(f)
                for row in reader:
                    try:
                        Array.append(row)
                    except Exception as e:
                        pass
        except:
            with open(file,'r',encoding="ISO-8859-1") as f:
                reader = csv.reader(f)
                for row in reader:
                    try:
                        Array.append(row)
                    except Exception as e:
                        pass

        self.data = []
        self.target = []
        for a in Array[1:]:
            if len(a) == 2:
                self.data.append(a[0])
                self.target.append(a[1])
    

    def classify(self, model):

        if model == 'NaiveBayes':
            text_clf = Pipeline([('vect', CountVectorizer(stop_words='english')),
                                 ('tfidf', TfidfTransformer()),
                                 ('clf',MultinomialNB())])
            # 10 fold cross validation 
            self.predicted = cross_val_predict(text_clf, self.data, self.target, cv=10)
            # fit the model
            text_clf.fit(self.data, self.target)
            y_score = text_clf.predict_proba(self.data)
        elif model == 'Perceptron':
            text_clf = Pipeline([('vect', CountVectorizer(stop_words='english')),
                                 ('tfidf', TfidfTransformer()),
                                 ('clf',Perceptron())])
            # 10 fold cross validation 
            self.predicted = cross_val_predict(text_clf, self.data, self.target, cv=10)
            # fit the model
            text_clf.fit(self.data, self.target)
            y_score = text_clf.decision_function(self.data)
        elif model == 'SGD':
            text_clf = Pipeline([('vect', CountVectorizer(stop_words='english')),
                                 ('tfidf', TfidfTransformer()),
                                 ('clf',SGDClassifier())])
            # 10 fold cross validation 
            self.predicted = cross_val_predict(text_clf, self.data, self.target, cv=10)
            # fit the model
            text_clf.fit(self.data, self.target)
            y_score = text_clf.decision_function(self.data)
        elif model == 'RandomForest':
            text_clf = Pipeline([('vect', CountVectorizer(stop_words='english')),
                                 ('tfidf', TfidfTransformer()),
                                 ('clf',RandomForestClassifier(n_estimators=100))])
            # 10 fold cross validation 
            self.predicted = cross_val_predict(text_clf, self.data, self.target, cv=10)
            # fit the model
            text_clf.fit(self.data, self.target)
            y_score = text_clf.predict_proba(self.data)
        elif model == 'KNN':
            text_clf = Pipeline([('vect', CountVectorizer(stop_words='english')),
                                 ('tfidf', TfidfTransformer()),
                                 ('clf',KNeighborsClassifier(n_neighbors=10))])
            # 10 fold cross validation 
            self.predicted = cross_val_predict(text_clf, self.data, self.target, cv=10)
            # fit the model
            text_clf.fit(self.data, self.target)
            y_score = text_clf.predict_proba(self.data)
        elif model == 'passiveAggressive':
            text_clf = Pipeline([('vect', CountVectorizer(stop_words='english')),
                                 ('tfidf', TfidfTransformer()),
                                 ('clf',PassiveAggressiveClassifier(n_iter=50))])
            # 10 fold cross validation 
            self.predicted = cross_val_predict(text_clf, self.data, self.target, cv=10)
            # fit the model
            text_clf.fit(self.data, self.target)
            y_score = text_clf.decision_function(self.data)           
            
        # get 10 fold cross validation accuracy score
        fold_scores = cross_val_score(text_clf, self.data, self.target, cv=10)
        fname_folds = 'accuracy_score.csv'
        with open(self.localSavePath + fname_folds,'w',newline="") as f:
            writer = csv.writer(f)
            writer.writerow(['fold_1','fold_2','fold_3','fold_4','fold_5',
                             'fold_6','fold_7','fold_8','fold_9','fold_10'])
            writer.writerow([ '%.4f' % elem for elem in fold_scores ])
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname_folds)
        s3.generate_downloads(self.bucketName, self.awsPath, fname_folds)
        
        # pickle the Pipeline for future use
        fname_pickle = 'classification_pipeline.pickle'
        with open(self.localSavePath + fname_pickle,'wb') as f:
            pickle.dump(text_clf,f)
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname_pickle)
        s3.generate_downloads(self.bucketName, self.awsPath, fname_pickle)

        # plotting the roc curve
        self.labels = text_clf.classes_       
        y = label_binarize(self.target,classes = self.labels)

        
        # binary class
        if len(self.labels) <= 2:
            if model == 'Perceptron' or model == 'SGD' or model == 'passiveAggressive':
                fpr, tpr, _ = roc_curve(y[:, 0], y_score)
            else:
                y = []
                for label in self.target:
                    item = []
                    for i in range(len(text_clf.classes_)):
                        if label == text_clf.classes_[i]:
                            item.append(1)
                        else:
                            item.append(0)
                    y.append(item)
                y = np.array(y)
                fpr, tpr, _ = roc_curve(y.ravel(), y_score.ravel())
            
            roc_auc = auc(fpr, tpr)
            trace = go.Scatter(
                x = fpr,
                y = tpr,
                name = 'ROC curve (area =' + str(roc_auc) + ' )',
                line = dict(color=('deeppink'), width = 4)
            )
            data = [trace]

        # multiclasses  
        else:
            fpr = {}
            tpr = {}
            roc_auc = {}
            for i in range(len(self.labels)):
                fpr[self.labels[i]], tpr[self.labels[i]], _ = roc_curve(y[:, i], y_score[:, i])
                roc_auc[self.labels[i]] = auc(fpr[self.labels[i]], tpr[self.labels[i]])
            
            # Compute micro-average ROC curve and ROC area
            fpr["micro"], tpr["micro"], _ = roc_curve(y.ravel(), y_score.ravel())
            roc_auc["micro"] = auc(fpr["micro"], tpr["micro"])

            # First aggregate all false positive rates
            all_fpr = np.unique(np.concatenate([fpr[self.labels[i]] for i in range(len(self.labels))]))

            # Then interpolate all ROC curves at this points
            mean_tpr = np.zeros_like(all_fpr)
            for i in range(len(self.labels)):
                mean_tpr += interp(all_fpr, fpr[self.labels[i]], tpr[self.labels[i]])

            # Finally average it and compute AUC
            mean_tpr /= len(self.labels)

            fpr["macro"] = all_fpr
            tpr["macro"] = mean_tpr
            roc_auc["macro"] = auc(fpr["macro"], tpr["macro"])

            # plotting
            trace0 = go.Scatter(
                x = fpr['micro'],
                y = tpr['micro'],
                name = 'micro-average ROC curve (area =' + str(roc_auc["micro"]) + ' )',
                line = dict(color=('deeppink'), width = 4)
            )
            trace1 = go.Scatter(
                x = fpr['macro'],
                y = tpr['macro'],
                 name = 'macro-average ROC curve (area =' + str(roc_auc["macro"]) + ' )',
                line = dict(
                    color = ('navy'),
                    width = 4,)
            )
            data = [trace0, trace1]
            colors = cycle(['aqua', 'darkorange', 'cornflowerblue'])
            for i, color in zip(range(len(self.labels)), colors):
                trace = go.Scatter(
                    x = fpr[self.labels[i]], 
                    y = tpr[self.labels[i]],
                    name = 'ROC curve of class {0} (area = {1:0.2f})'.format(self.labels[i], roc_auc[self.labels[i]]),
                    line = dict(
                        color = (color),
                        width = 4, 
                        dash = 'dash')
                )
                data.append(trace)

                
        layout = dict(title = model + ' model ROC curve',
              xaxis = dict(title = 'False Positive Rate'),
              yaxis = dict(title = 'True Positive Rate'),
              )

        fig = dict(data=data, layout=layout)
        div = plot(fig, output_type='div',image='png',auto_open=False, image_filename='plot_img')
        
        # print the graph file
        fname_div ='div.dat'
        with open(self.localSavePath + fname_div,'w') as f:
            f.write(div)
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname_div)
        # s3.generate_downloads(self.bucketName, self.awsPath, fname_div)
        print(self.localSavePath + fname_div)

    def metrics(self):
        report = np.array(metrics.precision_recall_fscore_support(self.target,self.predicted,labels=self.labels)).T
        avg_report = list(metrics.precision_recall_fscore_support(self.target,self.predicted,average='weighted'))
        avg_report.insert(0,'AVG')

        # save metrics report
        fname_metrics = 'classification_report.csv'
        with open(self.localSavePath + fname_metrics,'w',newline="") as f:
            writer = csv.writer(f)
            writer.writerow(['label','precision','recall','f1-score','support'])
            for i in range(len(report)):
                writer.writerow([self.labels[i],
                                    round(report[i][0],4),
                                    round(report[i][1],4),
                                    round(report[i][2],4),
                                    round(report[i][3],4)])
            writer.writerow(avg_report)
        s3.upload(self.localSavePath, self.bucketName, self.awsPath, fname_metrics)
        s3.generate_downloads(self.bucketName, self.awsPath, fname_metrics)

        
        

if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--appPath', required=True)
    parser.add_argument('--file',required=True)
    parser.add_argument('--uuid',required=True)
    parser.add_argument('--model',required=True)
    parser.add_argument('--sessionID', required=False)
    args = parser.parse_args()

    # instead of generate new uuid, inherit it from user specification
    uid = args.uuid
    awsPath = args.sessionID + '/ML/classification/' + uid +'/'
    localSavePath = args.appPath + '/downloads/ML/classification/' + uid + '/'
    print(localSavePath)
    print(uid)
    
    if not os.path.exists(localSavePath):
        os.makedirs(localSavePath)

    # download config to that folder
    fname_config = 'config.dat'
    if s3.checkExist('socialmediamacroscope-smile', awsPath, fname_config): 
        s3.downloadToDisk('socialmediamacroscope-smile', fname_config, localSavePath, awsPath)
    else:
        # throw file not found error
        deleteDir.deletedir(localSavePath)
        raise ValueError('You\'re requesting ' + fname_config + ' file, and it\'s not found in your remote directory!')

    # append config.dat file
    if os.path.exists(localSavePath + fname_config):
        with open(localSavePath + fname_config, "r") as fp:
            data = json.load(fp)
            data.update(vars(args))
        with open(localSavePath + fname_config, "w") as f:
            json.dump(data,f)
    s3.upload(localSavePath,'socialmediamacroscope-smile' , awsPath, fname_config)

    
    
    classification = Classification(awsPath, localSavePath, args.file)
    classification.classify(args.model)
    classification.metrics()

    
        
