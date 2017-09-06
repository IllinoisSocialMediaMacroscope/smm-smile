import numpy as np
import matplotlib.pyplot as plt
from sklearn.feature_selection import mutual_info_regression
from sklearn.feature_selection import mutual_info_classif
from sklearn.feature_selection import f_regression
from sklearn.feature_selection import f_classif
from sklearn.feature_selection import chi2
from sklearn.feature_selection import SelectKBest
from sklearn.feature_selection import VarianceThreshold
from sklearn import preprocessing
import pandas
import uuid
import os
import argparse
import sys

class Feature:

    def __init__(self,input_file,custom_header=''):
        self.labeler = preprocessing.LabelEncoder()
        if custom_header=='':
            self.df = pandas.read_csv(input_file,sep=',',header=0)
        #print(self.df.shape)

    # trscoreform categorical data into numbers
    def label_encoding(self,column_heads):
        # input: column head name [LIST]
        for CH in column_heads:
            self.df[CH] = self.labeler.fit_transform(self.df[CH])
            #self.df[CH] = self.df[CH].astype(float)
        #print(self.df)
        

    def feature_selection(self,column_head,model,k):

        y = self.df[column_head]
        X = self.df.drop(column_head,1)

        if model == 'mutual_info_regression':
            selection = SelectKBest(mutual_info_regression,k=k)
            
        elif model == 'mutual_info_classif':
            selection = SelectKBest(mutual_info_classif,k=k)
            
        elif model == 'f_classif':
            selection = SelectKBest(f_classif,k=k)
            
        elif model == 'f_regression':
            selection = SelectKBest(f_regression,k=k)
            
        elif model == 'chi2':
            selection = SelectKBest(chi2,k=k)

        selection.fit(X,y)
        X_r = selection.transform(X)
        
        score = selection.scores_
        score /= np.max(score)  

        
        # save the figure
        column_name = X.columns.values.tolist()
        print("for each feature the " + model + " score is:")
        print(column_name)
        print(score)

        # save the data after feature selection!
        # save the new dataframe
        support = selection.get_support(indices=True)
        k_column_name = []
        for i in support:
            k_column_name.append(column_name[i])
        result = pandas.DataFrame(data=X_r, columns=k_column_name)
        result[column_head] = y

        DIR = os.path.join(os.path.dirname(__file__),'../../downloads/ML-feature')
        if not os.path.exists(DIR):
            os.makedirs(DIR)
        filename = DIR + '/' + str(uuid.uuid4())+'.csv'
        result.to_csv(filename,sep=',', encoding='utf-8',index=False)
        print('\n\n')
        print(result)
        print(filename)
        
        plt.figure(figsize=(12,3))
        i=1
        for col in column_name:
            plt.subplot(1,len(column_name),i)
            plt.scatter(X[col],y)
            plt.xlabel(col,fontsize=8)
            plt.ylabel('target',fontsize=8)
            plt.title(model+"  value={:.2f}".format(score[i-1]),fontsize=5)
            i += 1
        plt.tight_layout(pad=1,w_pad=0.4,h_pad=1.0)
        DIR = os.path.join(os.path.dirname(__file__), '../../public')
        if not os.path.exists(DIR):
            os.makedirs(DIR)
        filename = str(uuid.uuid4()) + '.png'
        plt.savefig(DIR + '/' + filename,format='png')
        print(filename)




if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--file', help='the filepath of input file',required=True)
    parser.add_argument('--encodeHeaders',nargs='+',help='the column head of categorical data that you wish to encode', required=False)
    parser.add_argument('--targetHeader',help='the target column head for training and testing', required=True)
    parser.add_argument('--model',help='the feature select model', required=True)
    parser.add_argument('--k',help='pick the top k or all', required=True)

    args = parser.parse_args()

    feature = Feature(args.file)

    if args.encodeHeaders:
        feature.label_encoding(args.encodeHeaders)

    feature.feature_selection(args.targetHeader,args.model,int(args.k))

            
