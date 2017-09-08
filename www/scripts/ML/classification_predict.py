import numpy as np
from sklearn import preprocessing
from sklearn import model_selection
from sklearn import svm
from sklearn.naive_bayes import MultinomialNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import SGDClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn import metrics
import pandas
import pickle
import uuid
import os
import argparse
import sys

class Predict:

    def __init__(self, input_model, predict_file, custom_header=''):
        self.labeler = preprocessing.LabelEncoder()
        with open(input_model,'rb') as m:
            self.clf = pickle.load(m)
        if custom_header=='':
            self.df = pandas.read_csv(predict_file,sep=',', header=0)

    # transform categorical data into numbers
    def label_encoding(self,column_heads):
        # input: column head name [LIST]
        for CH in column_heads:
            self.df[CH] = self.labeler.fit_transform(self.df[CH])

        #print(self.df)

    def perform_predicting(self):
        target = self.clf.predict(self.df)
        self.df['target']= target

        if self.df.shape[0] <50:
            print(self.df)
        else:
            print(self.df.head(50))

        # save predicted model
        DIR = os.path.join(os.path.dirname(__file__), '../../downloads/ML-predicting')
        if not os.path.exists(DIR):
            os.makedirs(DIR)
        filename = DIR + '/' + str(uuid.uuid4()) + '.csv'
        self.df.to_csv(filename,sep=',',encoding='utf-8',index=False)
        print(filename)
        

if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--modelfile', help='the filepath of model file',required=True)
    parser.add_argument('--file', help='the filepath of input file',required=True)
    parser.add_argument('--encodeHeaders',nargs='+',help='the column head of categorical data that you wish to encode', required=False)
    
    args = parser.parse_args()
    prediction = Predict(args.modelfile, args.file)

    if args.encodeHeaders:
        prediction.label_encoding(args.encodeHeaders)

    prediction.perform_predicting()

