import csv
import pandas
import random
import argparse
import uuid
import os
from plotly.offline import plot
import plotly.graph_objs as go
from os.path import join, dirname
import json

class Classification:

    def __init__(self,DIR, content):

        self.DIR = DIR

        Array = []
        with open(content,'r',encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                try:
                    Array.append(row)
                except Exception as e:
                    print(e)

        df = pandas.DataFrame(Array[1:], columns=Array[0])
        # find the unique tweet in a corpus
        if 'text' in Array[0]:
            self.corpus = list(set(df['text'].dropna().astype('str').tolist()))
        elif '_source.text' in Array[0]:
            self.corpus = list(set(df['text'].dropna().astype('str').tolist()))


    def split(self,ratio,filename):
        training_set = list(random.sample(self.corpus, int(len(self.corpus)*ratio/100)))
        testing_set = [item for item in self.corpus if item not in training_set]

        # plot a pie chart of the split
        labels = ['training set data points','unlabeled data points']
        values = [len(training_set), len(testing_set)]
        trace = go.Pie(labels=labels, values = values, textinfo='value')
        div_split = plot([trace], output_type='div',image='png',auto_open=False, image_filename='plot_img')
        fname_div_split = self.DIR + '/div_split.dat'
        with open(fname_div_split,"w") as f:
            f.write(div_split)
        print(fname_div_split)
        
        fname1 = self.DIR + '/TRAINING_' + filename  + '.csv'
        with open(fname1,'w',encoding="utf-8",newline="") as f:
            writer = csv.writer(f)
            writer.writerow(['tweet','category'])
            for row in training_set:
                try:
                    writer.writerow([row])
                except UnicodeDecodeError:
                    pass
        print(fname1)

        fname2 = self.DIR + '/UNLABELED_' + filename +'.csv'
        with open(fname2,'w',encoding="utf-8",newline="") as f:
            writer = csv.writer(f)
            writer.writerow(['tweet'])
            for row in testing_set:
                try:
                    writer.writerow([row])
                except UnicodeDecodeError:
                    pass
        print(fname2)


if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--content',required=True)
    parser.add_argument('--ratio',required=True)
    parser.add_argument('--filename',required=True)
    args = parser.parse_args()
       
    uid = str(uuid.uuid4())
    DIR = os.path.join('./downloads/ML/classification',uid)
    DIR = os.path.expanduser(
            os.path.expandvars(
              os.path.realpath(
                os.path.normpath(DIR)
              )
            )
          )
    if not os.path.exists(DIR):
        os.makedirs(DIR)
    print(uid)

    # save config.dat file
    with open(DIR + '/config.dat', "w") as f:
        json.dump(vars(args),f)
   
    classification = Classification(DIR, args.content)
    classification.split(int(args.ratio),args.filename)

    
        
