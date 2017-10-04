import networkx as nx
from networkx.readwrite import json_graph
from collections import defaultdict
import os
from os.path import join, dirname
import sys
import uuid
from plotly.graph_objs import *
from plotly import tools
from plotly.offline import plot
import argparse
import numpy
# from dotenv import load_dotenv
import csv
import warnings
import pandas
import json
# warnings.filterwarnings('ignore')


class Network:

    def __init__(self, DIR, input_file, relationships):

        self.DIR = DIR

        Array = []
        with open(input_file,'r',encoding="utf-8") as f:
            reader = csv.reader(f)
            try:
                for row in reader:
                    Array.append(row)
            except Exception as e:
                print(e)
        df = pandas.DataFrame(Array[1:],columns=Array[0])
        #df = pandas.read_csv(input_file, encoding="utf-8")
        
        if relationships == 'reply_to':
            if input_file.find('twitter-Tweet') != -1:
                df = df[['text','user.screen_name']].dropna()
                df['reply_to'] = df['text'].str.extract('^@([A-Za-z0-9-_]+)',expand=True)
                new_df = df[['reply_to','user.screen_name','text']].dropna()
                self.graph = nx.DiGraph()
                self.directed = 'directed'
                for row in new_df.iterrows():
                   self.graph.add_edge(row[1]['user.screen_name'], row[1]['reply_to'], text=row[1]['text'])

            elif input_file.find('twitter-Stream') != -1:
                df = df[['_source.text','_source.user.screen_name']].dropna()
                df['reply_to'] = df['_source.text'].str.extract('^@([A-Za-z0-9-_]+)',expand=True)
                new_df = df[['reply_to','_source.user.screen_name','_source.text']].dropna()
                self.graph = nx.DiGraph()
                self.directed = 'directed'
                for row in new_df.iterrows():
                   self.graph.add_edge(row[1]['_source.user.screen_name'], row[1]['reply_to'], text=row[1]['_source.text'])

        elif relationships == 'retweet_from':
            if input_file.find('twitter-Tweet') != -1:
                df = df[['text','user.screen_name']].dropna()
                df['retweet_from'] = df['text'].str.extract('RT @([A-Za-z0-9-_]+):',expand=True)
                new_df = df[['retweet_from','user.screen_name','text']].dropna()
                self.graph = nx.DiGraph()
                self.directed = 'directed'
                for row in new_df.iterrows():
                   self.graph.add_edge(row[1]['user.screen_name'],row[1]['retweet_from'],  text=row[1]['text'])

            elif input_file.find('twitter-Stream') != -1:
                df = df[['_source.text','_source.user.screen_name']].dropna()
                df['retweet_from'] = df['_source.text'].str.extract('RT @([A-Za-z0-9-_]+):',expand=True)
                new_df = df[['retweet_from','_source.user.screen_name','_source.text']].dropna()
                self.graph = nx.DiGraph()
                self.directed = 'directed'
                for row in new_df.iterrows():
                    self.graph.add_edge(row[1]['_source.user.screen_name'],row[1]['retweet_from'], text=row[1]['_source.text'])
                
        elif relationships == 'mentions':
            
            if input_file.find('twitter-Tweet') != -1:
                df = df[['text','user.screen_name']].dropna()
                df['mentions'] = df['text'].str.findall('@([A-Za-z0-9-_]+)')
                tmp = []
                def backend(r):
                    x = r['user.screen_name']
                    y = r['text']
                    zz = r['mentions']
                    for z in zz:
                        tmp.append({'screen_name':x, 
                                    'tweet':y,
                                    'mention':z})
                df.apply(backend,axis=1)
                new_df = pandas.DataFrame(tmp).dropna()
                    
            elif input_file.find('twitter-Stream') != -1:
                df = df[['_source.text','_source.user.screen_name']].dropna()
                df['mentions'] = df['_source.text'].str.findall('@([A-Za-z0-9-_]+)')
                tmp = []
                def backend(r):
                    x = r['_source.user.screen_name']
                    y = r['_source.text']
                    zz = r['mentions']
                    for z in zz:
                        tmp.append({'screen_name':x, 
                                   'tweet':y,
                                   'mention':z})
                df.apply(backend,axis=1)
                new_df = pandas.DataFrame(tmp).dropna()
                               
            self.graph = nx.DiGraph()
            self.directed = 'directed'
            for row in new_df.iterrows():
                self.graph.add_edge(row[1]['screen_name'], row[1]['mention'], text=row[1]['tweet'])
       
    def prune_network(self):
        d = nx.degree_centrality(self.graph)
        d = sorted(d.items(), key=lambda x: x[1],reverse=True)
        if len(d) >= 500:
            for n in d[500:]:
                self.graph.remove_node(n[0])
        self.graph.remove_nodes_from(nx.isolates(self.graph))
            
  
    def export_graph(self):
        # JSON format
        d3js_graph = json_graph.node_link_data(self.graph)
        d3js_graph['nodes'] = [
            {
                'id':node['id'],
                'connectivity':self.graph.in_degree()[node['id']] + self.graph.out_degree()[node['id']]
            }
            for node in d3js_graph['nodes']
        ]
        fname_d3js = self.DIR + '/d3js.json'
        with open(fname_d3js,"w") as f:
            json.dump(d3js_graph,f)
        print(fname_d3js)

        # Gehpi readable format
        fname_gephi = self.DIR + '/network.gml'
        nx.write_gml(self.graph,fname_gephi)
        print(fname_gephi)

        # Pajek format
        fname_pajek = self.DIR + '/network.net'
        nx.write_pajek(self.graph,fname_pajek)
        print(fname_pajek)
        

    def draw_graph(self,relationships,layout):

        if layout == 'spring':
            pos = nx.spring_layout(self.graph)
        elif layout == 'circular':
            pos = nx.circular_layout(self.graph)
        elif layout == 'fruchterman':
            pos = nx.fruchterman_reingold_layout(self.graph)
        elif layout == 'random':
            pos = nx.random_layout(self.graph)
        elif layout == 'shell':
            pos = nx.shell_layout(self.graph)
        elif layout == 'spectral':
            pos = nx.spectral_layout(self.graph)

        edge_attri = nx.get_edge_attributes(self.graph,'text')
        edge_trace = Scatter(x=[], y=[], text=[], line=Line(width=1,color='#b5b5b5'), hoverinfo='text',mode='lines',hoveron='points')
        for edge in self.graph.edges():
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            edge_trace['x'] += [x0,x1,None]
            edge_trace['y'] += [y0,y1,None]
            edge_trace['text'].append(edge_attri[edge])
            
        node_trace = Scatter(x=[],y=[],text=[],mode='markers', hoverinfo='text',hoveron='points+fills',
            marker=Marker(
                showscale=True,
                # colorscale options
                # 'Greys' | 'Greens' | 'Bluered' | 'Hot' | 'Picnic' | 'Portland' |
                # Jet' | 'RdBu' | 'Blackbody' | 'Earth' | 'Electric' | 'YIOrRd' | 'YIGnBu'
                colorscale='Portland', reversescale=False, color=[],
                size=10,
                colorbar=dict(
                    thickness=15,
                    title='node in-degree plus out-degree',
                    xanchor='left',
                    titleside='right'
                ),
                line=dict(width=2)))
        for node in self.graph.nodes():
            x, y= pos[node]
            node_trace['x'].append(x)
            node_trace['y'].append(y)

        # label
        # if digraph
        if relationships == 'reply_to':
            for node in self.graph.nodes():
                node_trace['marker']['color'].append(self.graph.in_degree()[node] + self.graph.out_degree()[node])
                node_trace['text'].append("@" + node + " is replied by " + str(self.graph.in_degree()[node]) + " user(s), and replies to " + str(self.graph.out_degree()[node]) + " user(s)")
                
        elif relationships == 'retweet_from':
            for node in self.graph.nodes():
                node_trace['marker']['color'].append(self.graph.in_degree()[node] + self.graph.out_degree()[node])
                node_trace['text'].append("@" + node + " is retweeted by " + str(self.graph.in_degree()[node]) + " user(s) and retweets from " + str(self.graph.out_degree()[node]) + " user(s)")

        elif relationships == 'mentions':
            for node in self.graph.nodes():
                node_trace['marker']['color'].append(self.graph.in_degree()[node] + self.graph.out_degree()[node])
                node_trace['text'].append("@" + node + " is mentioned by " + str(self.graph.in_degree()[node]) + " user(s) and mentions " + str(self.graph.out_degree()[node]) + " user(s)")
                
        fig = Figure(data=Data([edge_trace, node_trace]), layout=Layout(
                title= relationships + ' Network graph of 500 nodes with highest degree centrality',
                titlefont=dict(size=16), showlegend=False,
                hovermode='closest', margin=dict(b=20,l=5,r=5,t=40),
                annotations=[ dict(
                    text="Export to plot.ly to view the tweets and user information!",
                    showarrow=False,
                    xref="paper", yref="paper",
                    x=0.005, y=-0.002 ) ],
                xaxis=XAxis(showgrid=False, zeroline=False, showticklabels=False),
                yaxis=YAxis(showgrid=False, zeroline=False, showticklabels=False)
                ))
        div = plot(fig, output_type='div',image='png',auto_open=False, image_filename='plot_img')
        fname_div = self.DIR + '/div.dat'
        with open(fname_div,"w") as f:
            f.write(div)
        print(fname_div)


    def assortativity(self):
        result = {}
        result['average_degree_connectivity']=nx.average_degree_connectivity(self.graph)
        result['k_nearest_neighbors']=nx.k_nearest_neighbors(self.graph)
        # k degree distribution
        k_degree = []
        for k in result['average_degree_connectivity'].keys():
            k_degree.append((k, result['average_degree_connectivity'][k],result['k_nearest_neighbors'][k]))
            
        fname_assort = self.DIR + '/assortativity.csv'
        with open(fname_assort,"w",newline="") as f:
            writer = csv.writer(f)
            writer.writerow(('degree k','average_degree_connectivity','k_nearest_neighbors'))
            for line in k_degree:
                try:
                    writer.writerow(line)
                except UnicodeEncodeError:
                    pass
        print(fname_assort)



    def attributes(self):
        result = {}
        
        result['degree_centrality']=nx.degree_centrality(self.graph)
        result['in_degree_centrality']=nx.in_degree_centrality(self.graph)
        result['out_degree_centrality']=nx.out_degree_centrality(self.graph)
        result['closeness_centrality']=nx.closeness_centrality(self.graph)
        result['betweenness_centrality']=nx.betweenness_centrality(self.graph)
        result['load_centrality']=nx.load_centrality(self.graph)
        result['average_neighbor_degree']=nx.average_neighbor_degree(self.graph)
        result['square_clustering']=nx.square_clustering(self.graph)
        result['closeness_vitality']=nx.closeness_vitality(self.graph)
        
        # nodes attributes
        node_attributes = []
        for node in self.graph.nodes():
            node_attributes.append((node,
                                        result['degree_centrality'][node],
                                         result['in_degree_centrality'][node],
                                         result['out_degree_centrality'][node],
                                         result['closeness_centrality'][node],
                                         result['betweenness_centrality'][node],
                                         result['load_centrality'][node],
                                         result['average_neighbor_degree'][node],
                                         result['square_clustering'][node],
                                         result['closeness_vitality'][node]))

        # edges attributes     
        result['edge_betweenness_centrality']=nx.edge_betweenness_centrality(self.graph)
        result['edge_load']=nx.edge_load(self.graph)

        edge_attributes = []
        for edge in self.graph.edges():
            edge_attributes.append((edge, result['edge_betweenness_centrality'][edge],result['edge_load'][edge]))
        
        fname_node = self.DIR + '/node_attributes.csv'
        fname_edge = self.DIR + '/edge_attributes.csv'
        with open(fname_node,"w",newline="") as f:
            writer = csv.writer(f)
            writer.writerow(('node',
                             'degree_centrality',
                             'in_degree_centrality',
                             'out_degree_centrality',
                             'closeness_centrality',
                             'betweenness_centrality',
                             'load_centrality',
                             'average_neighbor_degree',
                             'square_clustering',
                             'closeness_vitality'))
            for line in node_attributes:
                try:
                    writer.writerow(line)
                except UnicodeEncodeError:
                    pass
        with open(fname_edge,"w",newline="") as f:
            writer = csv.writer(f)
            writer.writerow(('edge','edge_betweenness_centrality','edge_load'))
            for line in edge_attributes:
                try:
                    writer.writerow(line)
                except UnicodeEncodeError:
                    pass

        print(fname_node)
        print(fname_edge)


    def component(self):
        strong = nx.strongly_connected_components(self.graph)
        strong_nodes = []
        for n in strong:
            strong_nodes.append(list(n)[0])
            
        fname_strong = self.DIR + '/strongly_connected_component.csv'
        with open(fname_strong,"w",newline="") as f:
            writer = csv.writer(f)
            writer.writerow(['strongly_connected_component'])
            for line in strong_nodes:
                try:
                    writer.writerow([line])
                except UnicodeEncodeError:
                    pass   
        print(fname_strong)
        
        weak = nx.weakly_connected_components(self.graph)
        weak_nodes = []
        for n in weak:
            weak_nodes.append(list(n)[0])
        fname_weak = self.DIR + '/weakly_connected_component.csv'
        with open(fname_weak,"w",newline="") as f:
            writer = csv.writer(f)
            writer.writerow(['weakly_connected_component'])
            for line in weak_nodes:
                try:
                    writer.writerow([line])
                except UnicodeEncodeError:
                    pass   
        print(fname_weak)

    def triads(self):
        rslt={}
        rslt['triadic_census']=nx.triadic_census(self.graph)
        fname_triads = self.DIR + '/triads.csv'
        with open(fname_triads,"w",newline="") as f:
            writer = csv.writer(f)
            writer.writerow(('triad_names','number_of_occurences'))
            for k in rslt['triadic_census'].keys():
                try:
                    writer.writerow((k,rslt['triadic_census'][k]))
                except UnicodeEncodeError:
                    pass
        print(fname_triads)




if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--file', required=True)
    parser.add_argument('--layout',required=True)
    parser.add_argument('--relations',required=True)
    args = parser.parse_args()
    
    uid = str(uuid.uuid4())
    #DIR = os.environ.get('ROOTDIR') + os.environ.get('DOWNLOAD_NW_NETWORKX') +'/' + uid
    DIR = os.path.join('./downloads/NW/networkx',uid)
    if not os.path.exists(DIR):
        os.makedirs(DIR)

    fname = DIR + '/config.dat'
    with open(fname,"w") as f:
        json.dump(vars(args),f)
    print(fname)
    
    network = Network(DIR, args.file, args.relations)
    network.export_graph()    
    
    network.assortativity()
    network.attributes()
    network.component()                                
    network.triads()

    network.prune_network()
    network.draw_graph(args.relations, args.layout) #, args.node_size, args.edge_width)
