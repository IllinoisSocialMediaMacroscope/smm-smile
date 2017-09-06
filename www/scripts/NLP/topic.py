from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import pyLDAvis
import pyLDAvis.sklearn
from zipfile import *
import uuid
import argparse
import csv
import numpy as np
import warnings
warnings.filterwarnings('ignore')
import plotly.graph_objs as go
from plotly import tools
from plotly.offline import plot
import pandas as pd
from io import StringIO
import json
import os
from os.path import join, dirname
from dotenv import load_dotenv
##############################################
#           important!!!                     #
#           hacked past/translate/_init_     #
#           and builtin/misc.py              #
#           import imp problem!!!!           #
##############################################


class Topic_modeling:

    def __init__(self,DIR,file):

        self.DIR = DIR
            
        self.dataset = []
        if is_zipfile(file):
            with ZipFile(file) as z:
                for fname in z.namelist():
                    if fname[-4:] == '.csv':
                        csv = StringIO(z.read(fname).decode("utf-8",'ignore'))
                        df = pd.read_csv(csv, sep=",")
                        doc = ' '.join(df['body'].dropna().tolist())
                        self.dataset.append(doc)

    
    def vectorize(self,vectorizer,n_features):
        if vectorizer == 'TF':
            self.tf_vectorizer = CountVectorizer(strip_accents='unicode',lowercase=True,stop_words='english',
                            max_df=0.97,min_df=2,max_features=n_features)
            self.tf_matrix = self.tf_vectorizer.fit_transform(self.dataset)
            self.features = sorted(zip(self.tf_vectorizer.get_feature_names(),np.asarray(self.tf_matrix.sum(axis=0)).ravel()),
                                 key=lambda t:t[1],reverse=True)

            # save and plot later
            fname_features = self.DIR + '/tf_features.csv'
            with open(fname_features, "w", newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['Feature Term','Frequency'])
                try:
                    writer.writerows(self.features)
                except UnicodeEncodeError:
                    pass
            print(fname_features)
            
        elif vectorizer == 'TFIDF':
            self.tfidf_vectorizer = TfidfVectorizer(strip_accents='unicode',lowercase=True,stop_words='english',
                            max_df=0.97,min_df=2,max_features=n_features)
            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.dataset)
            self.features = sorted(zip(self.tfidf_vectorizer.get_feature_names(),np.asarray(self.tfidf_matrix.sum(axis=0)).ravel()),
                                 key=lambda t:t[1],reverse=True)

             # save and plot later
            fname_features = self.DIR + '/tfidf_features.csv'
            with open(fname_features, "w", newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['Feature Term','Frequency'])
                try:
                    writer.writerows(self.features)
                except UnicodeEncodeError:
                    pass
            print(fname_features)


    def plot_features(self):

        X=[]
        Y=[]
        for item in self.features[:30]:
            X.append(item[0])
            Y.append(item[1])
            
        trace = go.Bar(x=X,   y=Y,
                        marker=dict(color='rgba(200,75,73,1.0)',
                            line=dict(color='rgba(111,11,9,1.0)',
                                  width=1),
                        ),
                        name='top 30 features')
        layout = go.Layout(   title='Top 30 features',)
        fig = go.Figure(data=[trace],layout=layout)
        div = plot(fig,output_type='div',image='png',auto_open=False, image_filename='plot_img')
        fname_div = self.DIR + '/div_features.dat'
        with open(fname_div,"w") as f:
            f.write(div)
        print(fname_div)
        

    def fit_lda(self,n_topics,vectorizer,uid):
        if vectorizer == 'TF':
            self.lda_tf = LatentDirichletAllocation(n_topics=n_topics, random_state=0,learning_method='online',max_iter=10)
            self.lda_tf.fit(self.tf_matrix)
            p=pyLDAvis.sklearn.prepare(self.lda_tf, self.tf_matrix, self.tf_vectorizer)
            
        elif vectorizer == 'TFIDF':
            self.lda_tfidf = LatentDirichletAllocation(n_topics=n_topics, random_state=0,learning_method='online',max_iter=10)
            self.lda_tfidf.fit(self.tfidf_matrix)
            p=pyLDAvis.sklearn.prepare(self.lda_tfidf, self.tfidf_matrix, self.tfidf_vectorizer)

        fname_pyLDAvis = 'pyLDAvis-' + uid + '.html'
        public_DIR = os.path.dirname(__file__) + '../../../public/pyLDAvis/'
        if not os.path.exists(public_DIR):
            os.makedirs(public_DIR)  
        pyLDAvis.save_html(p,  public_DIR + fname_pyLDAvis)
        print(fname_pyLDAvis)


    def get_top50_words(self,vectorizer,n_topics):

        topic_array =np.empty([101,n_topics], dtype='O')

        if vectorizer == 'TF':
            for topic_idx, topic in enumerate(self.lda_tf.components_):
                topic_array[0,topic_idx] = "topic #" + str(topic_idx)
                count = 1
                for i in topic.argsort()[:1 - 1:-1]:
                    topic_array[count,topic_idx] = self.tf_vectorizer.get_feature_names()[i]
                    if count == 100:
                        break
                    count += 1
                    
        if vectorizer == 'TFIDF':
            for topic_idx, topic in enumerate(self.lda_tfidf.components_):
                topic_array[0,topic_idx] = "topic #" + str(topic_idx + 1)
                count = 1
                for i in topic.argsort()[:1 - 1:-1]:
                    topic_array[count,topic_idx] = self.tfidf_vectorizer.get_feature_names()[i]
                    if count == 100:
                        break
                    count += 1

        # save topic_array
        fname_topic = self.DIR + '/topic.csv'
        with open(fname_topic, "w", newline='') as f:
            writer = csv.writer(f)
            try:
                writer.writerows(topic_array)
            except UnicodeEncodeError:
                 pass
        print(fname_topic)
        
    
        

if __name__ =='__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--file', required=True)
    parser.add_argument('--vectorizer',required=True)
    parser.add_argument('--n_topics', required=True)
    parser.add_argument('--n_features', required=True)

    args = parser.parse_args()

    #save arguments
    dotenv_path = join(dirname(__file__), '../../.env')
    load_dotenv(dotenv_path)
    
    uid = str(uuid.uuid4())
    DIR = os.environ.get('ROOTDIR') + os.environ.get('DOWNLOAD_NLP_TOPIC') +'/' + uid
    if not os.path.exists(DIR):
        os.makedirs(DIR)

    fname = DIR + '/config.dat'
    with open(fname,"w") as f:
        json.dump(vars(args),f)
    print(fname)
    
    lda = Topic_modeling(DIR,args.file)
    lda.vectorize(args.vectorizer,int(args.n_features))
    lda.plot_features()
    lda.fit_lda(int(args.n_topics), args.vectorizer,uid)
    lda.get_top50_words(args.vectorizer,int(args.n_topics))
    

