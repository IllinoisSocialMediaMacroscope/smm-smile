import networkx as nx
from collections import defaultdict
import os
from os.path import join, dirname
import sys
import uuid
import json
from plotly.graph_objs import *
from plotly import tools
from plotly.offline import download_plotlyjs, init_notebook_mode, plot, iplot
import argparse
import numpy
from dotenv import load_dotenv
import csv
import warnings
import pandas
warnings.filterwarnings('ignore')


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
        
        if relationships == 'reply_to':
            if input_file.find('twitter-Tweet') != -1:
                df['reply_to'] = df['text'].str.extract('^@([A-Za-z]+[A-Za-z0-9-]+)',expand=True)
                new_df = df[['reply_to','user.screen_name','text']].dropna()
                self.graph = nx.DiGraph()
                self.directed = 'directed'
                for row in new_df.iterrows():
                   self.graph.add_edge(row[1]['user.screen_name'], row[1]['reply_to'], text=row[1]['text'])
            elif input_file.find('twitter-Stream') != -1:
                df['reply_to'] = df['_source.text'].str.extract('^@([A-Za-z]+[A-Za-z0-9-]+)',expand=True)
                new_df = df[['reply_to','_source.user.screen_name','_source.text']].dropna()
                self.graph = nx.DiGraph()
                self.directed = 'directed'
                for row in new_df.iterrows():
                   self.graph.add_edge(row[1]['_source.user.screen_name'], row[1]['reply_to'], text=row[1]['_source.text'])
               
        elif relationships == 'retweet_from':
            if input_file.find('twitter-Tweet') != -1:
                df['retweet_from'] = df['text'].str.extract('^@([A-Za-z]+[A-Za-z0-9-]+)',expand=True)
                new_df = df[['retweet_from','user.screen_name','text']].dropna()
                self.graph = nx.DiGraph()
                self.directed = 'directed'
                for row in new_df.iterrows():
                   self.graph.add_edge(row[1]['user.screen_name'], row[1]['retweet_from'], text=row[1]['text'])
            elif input_file.find('twitter-Stream') != -1:
                df['retweet_from'] = df['_source.text'].str.extract('^@([A-Za-z]+[A-Za-z0-9-]+)',expand=True)
                new_df = df[['retweet_from','_source.user.screen_name','_source.text']].dropna()
                self.graph = nx.DiGraph()
                self.directed = 'directed'
                for row in new_df.iterrows():
                    self.graph.add_edge(row[1]['retweet_from'],row[1]['_source.user.screen_name'], text=row[1]['_source.text'])
                
        elif relationships == 'mentions':
            pass
       

       
    def draw_graph(self,relationships,layout,node_size,edge_width):

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
        edge_trace = Scatter(x=[], y=[], text=[], line=Line(width=edge_width,color='#b5b5b5'), hoverinfo='text',mode='lines',hoveron='points')
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
                colorscale='Bluered', reversescale=False, color=[],
                size=node_size,
                colorbar=dict(
                    thickness=15,
                    title='node connectivity',
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
                node_trace['text'].append("@" + node + " replies to " + str(self.graph.in_degree()[node]) + " users, and is replied by " + str(self.graph.out_degree()[node]) + " users")
                
        elif relationships == 'retweet_from':
            for node in self.graph.nodes():
                node_trace['marker']['color'].append(self.graph.in_degree()[node] + self.graph.out_degree()[node])
                node_trace['text'].append("@" + node + " retweets from " + str(self.graph.in_degree()[node]) + " users and is retweeted from " + str(self.graph.out_degree()[node]) + " users")

        # if undirected
        elif relationships == 'mentions':
            for node, adjacencies in zip(self.graph.nodes(),self.graph.adjacency_list()):
                node_trace['marker']['color'].append(len(adjacencies))
                node_trace['text'].append("@" + node + ", connections:" + str(len(adjacencies)))
                
        fig = Figure(data=Data([edge_trace, node_trace]), layout=Layout(
                title= relationships + ' Network Graph',
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


    def approximation(self):
        result = {}
        result['all_pairs_node_connectivity'] = nx.all_pairs_node_connectivity(self.graph)
        result['node_connectivity'] = nx.node_connectivity(self.graph)

        if self.directed == 'undirected':
            result['k_components'] = nx.k_components(self.graph)
            result['average_clustering'] = nx.average_clustering(self.graph)

        fname_approx = self.DIR + '/appoximation.json'
        with open(fname_approx,"w") as f:
            json.dump(result, f, cls=SetEncoder,indent=2)
        print(fname_approx)



    def assortativity(self):
        result = {}
        result['degree_assortativity_coefficient']=nx.degree_assortativity_coefficient(self.graph)

        if self.directed == 'undirected':
            result['degree_pearson_correlation_coefficient']=nx.degree_pearson_correlation_coefficient(self.graph)
        
        result['average_neighbor_degree']=nx.average_neighbor_degree(self.graph)
        result['average_degree_connectivity']=nx.average_degree_connectivity(self.graph)
        result['k_nearest_neighbors']=nx.k_nearest_neighbors(self.graph)

        fname_assort = self.DIR + '/assortativity.json'
        with open(fname_assort,"w") as f:
            json.dump(result, f, cls=SetEncoder,indent=2)
        print(fname_assort)



    def centrality(self):
        result = {}
        result['degree_centrality']=nx.degree_centrality(self.graph)

        if self.directed == 'directed':
            result['in_degree_centrality']=nx.in_degree_centrality(self.graph)
            result['out_degree_centrality']=nx.out_degree_centrality(self.graph)
            
        result['closeness_centrality']=nx.closeness_centrality(self.graph)
        result['betweenness_centrality']=nx.betweenness_centrality(self.graph)

        # fix the tuple cant decode into json problem
        stringify_temp={}
        temp = nx.edge_betweenness_centrality(self.graph)
        for key in temp.keys():
            stringify_temp[str(key)] = temp[key]
        result['edge_betweenness_centrality']= stringify_temp

        if self.directed == 'undirected':
            result['current_flow_closeness_centrality']=nx.current_flow_closeness_centrality(self.graph)
            result['current_flow_betweenness_centrality']=nx.current_flow_betweenness_centrality(self.graph)

            stringify_temp={}
            temp = nx.edge_current_flow_betweenness_centrality(self.graph)
            for key in temp.keys():
                stringify_temp[str(key)] = temp[key]
            result['edge_current_flow_betweenness_centrality']=stringify_temp
            
            result['approximate_current_flow_betweenness_centrality']=nx.approximate_current_flow_betweenness_centrality(self.graph)
            result['eigenvector_centrality']=nx.eigenvector_centrality(self.graph)
            result['eigenvector_centrality_numpy']=nx.eigenvector_centrality_numpy(self.graph)
            result['katz_centrality']=nx.katz_centrality(self.graph)
            result['katz_centrality_numpy']=nx.katz_centrality_numpy(self.graph)
            result['communicability']=nx.communicability(self.graph)
            result['communicability_exp']=nx.communicability_exp(self.graph)
            result['communicability_centrality']=nx.communicability_centrality(self.graph)
            result['communicability_centrality_exp']=nx.communicability_centrality_exp(self.graph)
            result['communicability_betweenness_centrality']=nx.communicability_betweenness_centrality(self.graph)
            result['estrada_index']=nx.estrada_index(self.graph)
            
        result['load_centrality']=nx.load_centrality(self.graph)

        stringify_temp={}
        temp = nx.edge_load(self.graph)
        for key in temp.keys():
            stringify_temp[str(key)] = temp[key]
        result['edge_load']= stringify_temp
        result['dispersion']=nx.dispersion(self.graph)
        
        fname_centra = self.DIR + '/centrality.json'
        with open(fname_centra,"w") as f:
            json.dump(result, f, cls=SetEncoder,indent=2)
        print(fname_centra)




    def cluster(self):
        rslt={}
        
        rslt['transitivity']=nx.transitivity(self.graph)
        rslt['square_clustering']=nx.square_clustering(self.graph)

        if self.directed == 'undirected':
            rslt['traingles']=nx.triangles(self.graph)
            rslt['clustering']=nx.clustering(self.graph)
            rslt['average_clustering']=nx.average_clustering(self.graph)

        fname_cluster = self.DIR + '/cluster.json'
        with open(fname_cluster,"w") as f:
            json.dump(rslt, f, cls=SetEncoder,indent=2)
        print(fname_cluster)


    # only directed graph
    def component(self):
        rslt={}
        if self.directed == 'directed':
            rslt['is_strongly_connected']=nx.is_strongly_connected(self.graph)
            rslt['number_strongly_connected_components']=nx.number_strongly_connected_components(self.graph)
            rslt['is_semiconnected']=nx.is_semiconnected(self.graph)
            rslt['is_weakly_connected']=nx.is_weakly_connected(self.graph)
            rslt['number_weakly_connected_components']=nx.number_weakly_connected_components(self.graph)
        
        fname_component = self.DIR + '/component.json'
        with open(fname_component,"w") as f:
            json.dump(rslt, f, cls=SetEncoder,indent=2)
        print(fname_component)

    # only undirected graph
    def distance(self):
        rslt={}
        if self.directed =='undirected':
            rslt['center']=nx.center(self.graph)
            rslt['diameter']=nx.diameter(self.graph)
            rslt['eccentricity']=nx.eccentricity(self.graph)
            rslt['periphery']=nx.periphery(self.graph)
            rslt['radius']=nx.radius(self.graph)

        fname_distance = self.DIR + '/distance.json'
        with open(fname_distance,"w") as f:
            json.dump(rslt, f, cls=SetEncoder,indent=2)
        print(fname_distance)

    # directed
    def hierarchy(self):
        rslt={}

        if self.directed == 'directed':
            rslt['flow_hierarchy']=nx.flow_hierarchy(self.graph)
        rslt['isolates']=nx.isolates(self.graph)

        fname_hierarchy = self.DIR + '/' + 'hierarchy.json'
        with open(fname_hierarchy,"w") as f:
            json.dump(rslt, f, cls=SetEncoder,indent=2)
        print(fname_hierarchy)


    def googleMatrix(self):
        fname = self.DIR + '/googleMatricx.txt'
        google_matrix=nx.google_matrix(self.graph)
        numpy.savetxt(fname,google_matrix)
        print(fname)
        

    def path(self):
        rslt={}
        rslt['shortest_path']=nx.shortest_path(self.graph)
        #rslt['average_shortest_path_length']=nx.average_shortest_path_length(self.graph)
        rslt['all_pairs_shortest_path']=nx.all_pairs_shortest_path(self.graph)

        fname_path = self.DIR + '/path.json'
        with open(fname_path,"w") as f:
            json.dump(rslt, f, cls=SetEncoder,indent=2)
        print(fname_path)

    def tree(self):
        rslt={}
        rslt['is_tree']=nx.is_tree(self.graph)
        rslt['is_forest']=nx.is_forest(self.graph)

        if self.directed == 'directed':
            rslt['is_arborescence']=nx.is_arborescence(self.graph)
            rslt['is_branching']=nx.is_branching(self.graph)
            
        fname_tree = self.DIR + '/tree.json'
        with open(fname_tree,"w") as f:
            json.dump(rslt, f, cls=SetEncoder,indent=2)
        print(fname_tree)


    # directed
    def triads(self):
        rslt={}
        if self.directed == 'directed':
            rslt['triadic_census']=nx.triadic_census(self.graph)
        fname_triads = self.DIR + '/triads.json'
        with open(fname_triads,"w") as f:
            json.dump(rslt, f, cls=SetEncoder,indent=2)
        print(fname_triads)

    def vitality(self):
        rslt={}
        rslt['closeness_vitality']=nx.closeness_vitality(self.graph)
        fname_vitality = self.DIR + '/vitality.json'
        with open(fname_vitality,"w") as f:
            json.dump(rslt, f, cls=SetEncoder,indent=2)
        print(fname_vitality)

    def traversal(self):
        rslt={}
        
        rslt['dfs_predecessors']=nx.dfs_predecessors(self.graph)
        rslt['dfs_successors']=nx.dfs_successors(self.graph)
        #rslt['dfs_preorder_nodes']=nx.dfs_preorder_nodes(self.graph)
        #rslt['dfs_postorder_nodes']=nx.dfs_postorder_nodes(self.graph)
        #rslt['dfs_labeled_edges']=nx.dfs_labeled_edges(self.graph)
        #rslt['edge_dfs']=nx.edge_dfs(self.graph)
        #rslt['dfs_edges']=nx.dfs_edges(self.graph)
        #rslt['dfs_tree']=nx.dfs_tree(self.graph)

        fname_traversal = self.DIR + '/traversal.json'
        with open(fname_traversal,"w") as f:
            json.dump(rslt, f, cls=SetEncoder,indent=2)
        print(fname_traversal)


class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        if isinstance(obj, matrix):
            return str(obj)
        return json.JSONEncoder.default(self, obj)
            

if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Processing...")
    parser.add_argument('--file', required=True)
    parser.add_argument('--layout',required=True)
    parser.add_argument('--relationships',required=True)
    parser.add_argument('--node_size',required=True)
    parser.add_argument('--edge_width',required=True)
   
    args = parser.parse_args()

    #save arguments
    dotenv_path = join(dirname(__file__), '../../.env')
    load_dotenv(dotenv_path)
    
    uid = str(uuid.uuid4())
    DIR = os.environ.get('ROOTDIR') + os.environ.get('DOWNLOAD_NW_NETWORKX') +'/' + uid
    if not os.path.exists(DIR):
        os.makedirs(DIR)

    fname = DIR + '/config.dat'
    with open(fname,"w") as f:
        json.dump(vars(args),f)
    print(fname)
    
    network = Network(DIR, args.file, args.relationships)
    network.draw_graph(args.relationships, args.layout, args.node_size, args.edge_width)

    
    #network.approximation()
    try:
        network.assortativity()
    except:
        pass

    try:
        network.centrality()
    except:
        pass

    try:
        network.cluster()
    except:
        pass

    if (args.relationships == 'reply_to' or args.relationships == 'retweet_from'):
        try:
            network.component()
        except:
            pass

        try:
            network.hierarchy()
        except:
            pass

        try:
            network.triads()
        except:
            pass
        
    if (args.relationships == 'mentions'):
        try:
            network.distance()
        except:
            pass
    
    # network.googleMatrix()
    try:
        network.path()
    except:
        pass
    try:
        network.tree()
    except:
        pass
    try:
        network.vitality()
    except:
        pass
    try:
        network.traversal()
    except:
        pass
