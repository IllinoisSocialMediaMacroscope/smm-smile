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

class Classification:

    def __init__(self,uuid):

        self.DIR = os.path.join('./downloads/ML/classification',uuid)
        self.DIR = os.path.expanduser(
                os.path.expandvars(
                  os.path.realpath(
                    os.path.normpath(self.DIR)
                  )
                )
              )

        print(uuid)

    def predict(self):

        # load classification model
        pkl_model = os.path.join(self.DIR,'classification_pipeline.pickle')
        with open(pkl_model,'rb') as f:
            text_clf = pickle.load(f)

        # load text set
        listing = os.listdir(self.DIR)
        for file in listing:
            if file[0:8] == 'TESTING_' and file[-4:] == '.csv':
                filename = file[8:-4]
                data = []
                with open(os.path.join(self.DIR, file),'r',encoding='utf-8') as f:
                    reader = list(csv.reader(f))
                    for row in reader[1:]:
                        try:
                            data.extend(row)
                        except Exception as e:
                            pass

        # predict using trained model         
        self.predicted = text_clf.predict(data)

        # save result
        fname = os.path.join(self.DIR,'PREDICTED_' + filename + '.csv')
        with open(fname,'w',encoding="utf-8",newline="") as f:
            writer = csv.writer(f)
            writer.writerow(['tweet','category'])
            for i in range(len(data)):
                try:
                    writer.writerow([data[i],self.predicted[i]])
                except UnicodeDecodeError:
                    pass
        print(fname)

    def plot(self):
        y_pred_dict = Counter(self.predicted)
        labels = []
        values = []
        for i in y_pred_dict.keys():
            labels.append("class: " + str(i))
            values.append(y_pred_dict[i])
        trace = go.Pie(labels=labels, values = values, textinfo='label')
        div_comp = plot([trace], output_type='div',image='png',auto_open=False, image_filename='plot_img')
        fname_div_comp = self.DIR + '/div_comp.dat'
        with open(fname_div_comp,"w") as f:
            f.write(div_comp)
        print(fname_div_comp)


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--uuid',required=True)
    args = parser.parse_args()
       
    
    classification = Classification(args.uuid)
    classification.predict()
    classification.plot()

    
        
