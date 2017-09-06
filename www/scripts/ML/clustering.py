import numpy as np
## import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.datasets import load_digits
from sklearn import metrics
from sklearn.decomposition import PCA
from sklearn.cluster import AffinityPropagation
from sklearn.cluster import AgglomerativeClustering
from sklearn.cluster import Birch
from sklearn.cluster import DBSCAN
from sklearn.cluster import MiniBatchKMeans
from sklearn.cluster import MeanShift
#from sklearn.cluster import SpectralClustering
from sklearn import preprocessing
import pandas
from time import time
import uuid
import argparse
#import plotly.plotly as py
import plotly.graph_objs as go
#from plotly import tools
from plotly.offline import download_plotlyjs, init_notebook_mode, plot, iplot
import json
import os
from os.path import join, dirname
from dotenv import load_dotenv
import csv
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

class Cluster:

    def __init__(self, DIR, input_file,fields):

        self.DIR = DIR

        '''Array = []
        with open(input_file,'r',encoding="utf-8") as f:
            reader = csv.reader(f)
            try:
                for row in reader:
                    Array.append(row)
            except Exception as e:
                print(e)

        self.df = pandas.DataFrame(Array[1:],columns=Array[0])'''

        self.original = pandas.read_csv(input_file,encoding="utf-8")
        self.original = self.original.dropna(axis=0, how='any', subset=fields)
        
        self.features = self.original.copy(deep=True)
        self.features = self.features[fields] 
        

        # transform the categorical fields
        # should change this part. name field shouldn't participate in the algorithm
        column_headers = self.features.select_dtypes(include = ['object']).columns
        labeler = preprocessing.LabelEncoder()
        for CH in column_headers:
            self.features[CH] = labeler.fit_transform(self.features[CH])       
       
    def estimating(self, es_model, n_clusters=5):
        t0 = time()
        if es_model == 'PCA-Kmeans':
            pca = PCA(n_components=n_clusters).fit(self.features)
            estimator = KMeans(init=pca.components_, n_clusters=n_clusters, random_state=42,n_init=1)
        elif es_model == 'random-Kmeans':
            estimator = KMeans(init='random', n_clusters=n_clusters, random_state=42)
        elif es_model =='k-means++':
            estimator = KMeans(init='k-means++', n_clusters=n_clusters, random_state=42,n_init=10)
        elif es_model == 'AffinityPropagation':
            estimator = AffinityPropagation()
        elif es_model == 'AgglomerativeClustering':
            estimator = AgglomerativeClustering(n_clusters=n_clusters)
        elif es_model == 'Birch':
            estimator = Birch(n_clusters=n_clusters)
        elif es_model == 'DBSCAN':
            estimator = DBSCAN(metric='euclidean')
        elif es_model == 'MiniBatchKMeans':
            estimator = MiniBatchKMeans(n_clusters=n_clusters,random_state=42)
        elif es_model == 'MeanShift':
            estimator = MeanShift()
        #elif es_model == 'SpectralClustering':
        #   estimator = SpectralClustering(n_clusters=n_clusters,affinity="nearest_neighbors")
            
        y_pred = estimator.fit_predict(self.features)
        self.original['y_pred'] = y_pred
        self.features['y_pred'] = y_pred

        # save 
        filename1 = self.DIR + '/clustering-complete.csv'
        self.original.to_csv(filename1,sep=',',encoding='utf-8',index=False)
        print(filename1) # first line

        # save 
        filename2 = self.DIR + '/clustering-features.csv'
        self.features.to_csv(filename2,sep=',',encoding='utf-8',index=False)
        print(filename2) # first line


        return y_pred

        
        
    def visualization(self,y_pred):

        # print pca reduced 2d graph
        reduced_data = PCA(n_components=2).fit_transform(self.features)
        data = [
            go.Scatter(
                x=reduced_data[:,0], 
                y=reduced_data[:,1],
                mode = "markers",
                marker=dict(
                    size=8,
                    color=y_pred,
                    autocolorscale=False,
                    colorscale = 'Portland'
                    #[[-1,'Greys'], [1,'YlGnBu'], [2,'Greens'], [3,'YlOrRd'], [4,'Bluered'], [5,'RdBu'],
                                  #[6,'Reds'], [7,'Blues'], [8,'Picnic'], [9,'Rainbow'], [10,'Portland'], [11,'Jet'],
                                  #[12,'Hot'], [13,'Blackbody'], [14,'Earth'], [15,'Electric'], [0,'Viridis']]                    
                )
            )
        ]

        layout = go.Layout(            
            title="PCA reduced clustering n_components=2"
        )
        
        figure = go.Figure(data=data,layout=layout)
        div = plot(figure,output_type='div', image='png',auto_open=False, image_filename='plot_img')
        fname_div = self.DIR + '/div.dat'
        with open(fname_div,"w") as f:
            f.write(div)
        print(fname_div)


        # visualize the prediction
        y_pred_dict = Counter(y_pred)
        labels = []
        values = []
        for i in y_pred_dict.keys():
            labels.append("cluster #" + str(i))
            values.append(y_pred_dict[i])
        trace = go.Pie(labels=labels, values = values, textinfo='label')
        div_comp = plot([trace], output_type='div',image='png',auto_open=False, image_filename='plot_img')
        fname_div_comp = self.DIR + '/div_comp.dat'
        with open(fname_div_comp,"w") as f:
            f.write(div_comp)
        print(fname_div_comp)
        

if __name__ =='__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--file', required=True)
    parser.add_argument('--fields',nargs='+',required=False)
    parser.add_argument('--estimator', required=True)
    parser.add_argument('--n_clusters',required=False)

    args = parser.parse_args()

    #save arguments
    dotenv_path = join(dirname(__file__), '../../.env')
    load_dotenv(dotenv_path)
    
    uid = str(uuid.uuid4())
    DIR = os.environ.get('ROOTDIR') + os.environ.get('DOWNLOAD_ML_CLUSTERING') +'/' + uid
    if not os.path.exists(DIR):
        os.makedirs(DIR)

    fname = DIR + '/config.dat'
    with open(fname,"w") as f:
        json.dump(vars(args),f)
    print(fname)
    
    clustering = Cluster(DIR,args.file,args.fields)
    y_pred = clustering.estimating(es_model=args.estimator, n_clusters=int(args.n_clusters))
    clustering.visualization(y_pred)
