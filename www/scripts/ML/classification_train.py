import csv
import argparse
import os
from os.path import join, dirname
from sklearn.model_selection import train_test_split
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
from scipy import interp
from itertools import cycle
import pickle
import numpy as np
from plotly.offline import plot
import plotly.graph_objs as go

class Classification:

    def __init__(self,file,uuid):

        self.DIR = os.path.join('./downloads/ML/classification',uuid)
        self.DIR = os.path.expanduser(
                os.path.expandvars(
                  os.path.realpath(
                    os.path.normpath(self.DIR)
                  )
                )
              )

        print(uuid)
        Array = []
        with open(file,'r',encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                try:
                    Array.append(row)
                except Exception as e:
                    print(e)

        self.data = []
        self.target = []
        for a in Array[1:]:
            if len(a) == 2:
                self.data.append(a[0])
                self.target.append(a[1])
    

    def split(self):
        # 2/8 save some for evaluating the performance
        self.X_train,self.X_test,self.y_train, self.y_test = train_test_split(self.data, self.target, test_size=0.2, random_state=42)

    def classify(self, model):

        if model == 'NaiveBayes':
            text_clf = Pipeline([('vect', CountVectorizer(stop_words='english')),
                                 ('tfidf', TfidfTransformer()),
                                 ('clf',MultinomialNB())])
            text_clf.fit(self.X_train, self.y_train)
            self.predicted = text_clf.predict(self.X_test)
            y_score = text_clf.predict_proba(self.X_test)
        elif model == 'Perceptron':
            text_clf = Pipeline([('vect', CountVectorizer(stop_words='english')),
                                 ('tfidf', TfidfTransformer()),
                                 ('clf',Perceptron())])
            text_clf.fit(self.X_train, self.y_train)
            self.predicted = text_clf.predict(self.X_test)
            y_score = text_clf.decision_function(self.X_test)
        elif model == 'SGD':
            text_clf = Pipeline([('vect', CountVectorizer(stop_words='english')),
                                 ('tfidf', TfidfTransformer()),
                                 ('clf',SGDClassifier())])
            text_clf.fit(self.X_train, self.y_train)
            self.predicted = text_clf.predict(self.X_test)
            y_score = text_clf.decision_function(self.X_test)
        elif model == 'RandomForest':
            text_clf = Pipeline([('vect', CountVectorizer(stop_words='english')),
                                 ('tfidf', TfidfTransformer()),
                                 ('clf',RandomForestClassifier(n_estimators=100))])
            text_clf.fit(self.X_train, self.y_train)
            self.predicted = text_clf.predict(self.X_test)
            y_score = text_clf.predict_proba(self.X_test)
        elif model == 'KNN':
            text_clf = Pipeline([('vect', CountVectorizer(stop_words='english')),
                                 ('tfidf', TfidfTransformer()),
                                 ('clf',KNeighborsClassifier(n_neighbors=10))])
            text_clf.fit(self.X_train, self.y_train)
            self.predicted = text_clf.predict(self.X_test)
            y_score = text_clf.predict_proba(self.X_test)
        elif model == 'passiveAggressive':
            text_clf = Pipeline([('vect', CountVectorizer(stop_words='english')),
                                 ('tfidf', TfidfTransformer()),
                                 ('clf',PassiveAggressiveClassifier(n_iter=50))])
            text_clf.fit(self.X_train, self.y_train)
            self.predicted = text_clf.predict(self.X_test)
            y_score = text_clf.decision_function(self.X_test)           
            
            
        # pickle the Pipeline for future use
        fname_pickle = os.path.join(self.DIR,'classification_pipeline.pickle')
        with open(fname_pickle,'wb') as f:
            pickle.dump(text_clf,f)
        print(fname_pickle)

        # plotting the roc curve
        self.labels = text_clf.classes_

        
        y = label_binarize(self.y_test,classes = self.labels)
        
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
        layout = dict(title = 'ROC curve',
              xaxis = dict(title = 'False Positive Rate'),
              yaxis = dict(title = 'True Positive Rate'),
              )

        fig = dict(data=data, layout=layout)
        div = plot(fig, output_type='div',image='png',auto_open=False, image_filename='plot_img')
        
        # print the graph file
        fname_div = os.path.join(self.DIR,'div.dat')
        with open(fname_div,'w') as f:
            f.write(div)
        print(fname_div)

    def metrics(self):
        
        report = np.array(metrics.precision_recall_fscore_support(self.y_test,self.predicted,labels=self.labels)).T
        avg_report = list(metrics.precision_recall_fscore_support(self.y_test,self.predicted,average='weighted'))
        avg_report.insert(0,'AVG')

        # save metrics report
        fname_metrics = os.path.join(self.DIR,'classification_report.csv')
        with open(fname_metrics,'w',encoding="utf-8",newline="") as f:
            writer = csv.writer(f)
            writer.writerow(['label','precision','recall','f1-score','support'])
            for i in range(len(report)):
                writer.writerow([self.labels[i],report[i][0],report[i][1],report[i][2],report[i][3]])
            writer.writerow(avg_report)
        print(fname_metrics)

        

if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--file',required=True)
    parser.add_argument('--uuid',required=True)
    parser.add_argument('--model',required=True)
    args = parser.parse_args()
       
    
    classification = Classification(args.file, args.uuid)
    classification.split()
    classification.classify(args.model)
    classification.metrics()

    
        
