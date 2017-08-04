import numpy as np
from sklearn import preprocessing
from sklearn import model_selection
from sklearn import svm
from sklearn.naive_bayes import MultinomialNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
#from sklearn.linear_model import SGDClassifier
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
import warnings

class Training:

    def __init__(self, input_fname, custom_header=''):
        self.labeler = preprocessing.LabelEncoder()
        if custom_header=='':
            self.df = pandas.read_csv(input_fname,sep=',', header=0)

    # transform categorical data into numbers
    def label_encoding(self,column_heads):
        # input: column head name [LIST]
        for CH in column_heads:
            self.df[CH] = self.labeler.fit_transform(self.df[CH])
        #print(self.df)
        #print(self.df)

    # choose target, split and train
    def perform_training(self,column_head,model,test_size=0.3):
        # input: target column head, test_size, model
        y = self.df[column_head]
        X = self.df.drop(column_head,1)
        #print(X,y)

        X_train, X_test, y_train, y_test =\
        model_selection.train_test_split(X,y,test_size=test_size,random_state=42)
    

        # start classification
        if model == 'SVM':
            clf = svm.SVC()
        elif model == 'MultinomialNB':
            clf = MultinomialNB()
        elif model == 'KNN':
            clf = KNeighborsClassifier(n_neighbors=1)
        elif model == 'DecisionTree':
            clf = DecisionTreeClassifier()
        #elif model == 'SGD':
        #    clf = SGDClassifier()
        elif model == 'LogisticRegression':
            clf = LogisticRegression()
        elif model == 'RandomForest':
            clf = RandomForestClassifier()
        elif model == 'GBC':
            clf = GradientBoostingClassifier()
        elif model == 'MLP':
            clf = MLPClassifier(max_iter=1000)

        clf.fit(X_train,y_train)
        y_predict = clf.predict(X_test)

        # evaluate the model performance
        print(metrics.classification_report(y_test, y_predict))

        # save_fitted model
        DIR = os.path.join(os.path.dirname(__file__), '../../downloads/ML-training')
        if not os.path.exists(DIR):
            os.makedirs(DIR)
        filename = DIR + '/' + model + '-'+ str(uuid.uuid4()) + '.pickle'
        pickle.dump(clf, open(filename,'wb'))
        print(filename)



if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--file', help='the filepath of input file',required=True)
    parser.add_argument('--encodeHeaders',nargs='+',help='the column head of categorical data that you wish to encode', required=False)
    parser.add_argument('--targetHeader',help='the target column head for training and testing', required=True)
    parser.add_argument('--model',help='the training model you select', required=True)
    parser.add_argument('--test_size',help='the test size',required=False)

    args = parser.parse_args()
    #print(args)
    train_model = Training(args.file)

   

    if args.encodeHeaders:
        train_model.label_encoding(args.encodeHeaders)

    if args.test_size !='':     
        train_model.perform_training(args.targetHeader,args.model,float(args.test_size))
    else:
        train_model.perform_training(args.targetHeader,args.model)
    

        
