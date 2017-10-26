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

    def classify(self):
        text_clf = Pipeline([('vect', CountVectorizer(stop_words='english')),
                             ('tfidf', TfidfTransformer()),
                             ('clf',MultinomialNB())])
        text_clf.fit(self.X_train, self.y_train)
        self.predicted = text_clf.predict(self.X_test)

        # pickle the Pipeline for future use
        fname_pickle = os.path.join(self.DIR,'classification_pipeline.pickle')
        with open(fname_pickle,'wb') as f:
            pickle.dump(text_clf,f)
        print(fname_pickle)

    def metrics(self):
        labels = list(set(self.y_test))
        report = np.array(metrics.precision_recall_fscore_support(self.y_test,self.predicted,labels=labels)).T
        avg_report = list(metrics.precision_recall_fscore_support(self.y_test,self.predicted,average='weighted'))
        avg_report.insert(0,'AVG')

        # save metrics report
        fname_metrics = os.path.join(self.DIR,'classification_report.csv')
        with open(fname_metrics,'w',encoding="utf-8",newline="") as f:
            writer = csv.writer(f)
            writer.writerow(['label','precision','recall','f1-score','support'])
            for i in range(len(report)):
                writer.writerow([labels[i],report[i][0],report[i][1],report[i][2],report[i][3]])
            writer.writerow(avg_report)
        print(fname_metrics)



if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--file',required=True)
    parser.add_argument('--uuid',required=True)
    args = parser.parse_args()
       
    
    classification = Classification(args.file, args.uuid)
    classification.split()
    classification.classify()
    classification.metrics()

    
        
