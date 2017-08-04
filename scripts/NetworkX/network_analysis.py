import networkx as nx
from collections import defaultdict
import os
import sys
import uuid
import json
from plotly.graph_objs import *
from plotly import tools
from plotly.offline import download_plotlyjs, init_notebook_mode, plot, iplot
import argparse
import numpy

class Network:

    def __init__(self, input_fname, directed):
        self.uid = str(uuid.uuid4())
        self.DIR = os.path.join(os.path.dirname(__file__), '../../downloads/networkx-graphs/' + self.uid)
        if not os.path.exists(self.DIR):
            os.makedirs(self.DIR)
            
        data = [ line.strip().split(',')
                        for line in open(input_fname)][1:]
        
        if directed == 'directed':
            self.graph = nx.DiGraph()
        elif directed == 'undirected':
            self.graph = nx.Graph()
        self.directed = directed;
        
        for (node, followed_by) in data:
            self.graph.add_edge(node, followed_by) # in undirected graph it will just be node1 and node2

       

    def draw_graph(self,layout,node_size,edge_width):

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

        edge_trace = Scatter(x=[], y=[], line=Line(width=edge_width,color='#428bca'), mode='lines')
        for edge in self.graph.edges():
            x0, y0 = pos[edge[0]]
            x1, y1 = pos[edge[1]]
            edge_trace['x'] += [x0,x1,None]
            edge_trace['y'] += [y0,y1,None]
            
        node_trace = Scatter(x=[],y=[],text=[],mode='markers', hoverinfo='all',hoveron='points',
            marker=Marker(
                showscale=True,
                # colorscale options
                # 'Greys' | 'Greens' | 'Bluered' | 'Hot' | 'Picnic' | 'Portland' |
                # Jet' | 'RdBu' | 'Blackbody' | 'Earth' | 'Electric' | 'YIOrRd' | 'YIGnBu'
                colorscale='Portland', reversescale=True, color=[],
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
        if self.directed == 'directed':
            for node in self.graph.nodes():
                node_trace['marker']['color'].append(self.graph.in_degree()[node]+self.graph.out_degree()[node])
                node_trace['text'].append(str({"label":node, "Followers":self.graph.in_degree()[node],
                                                "Following":self.graph.out_degree()[node],"centrality":nx.betweenness_centrality(self.graph)[node]}))
        elif self.directed == 'undirected':
            for node, adjacencies in zip(self.graph.nodes(),self.graph.adjacency_list()):
                node_trace['marker']['color'].append(len(adjacencies))
                node_trace['text'].append(str({"label":node, "# of connections":len(adjacencies),
                                               "centrality":nx.betweenness_centrality(self.graph)[node]}))
                
        fig = Figure(data=Data([edge_trace, node_trace]), layout=Layout(
                title='Network Graph ( ' +self.directed +' )',
                titlefont=dict(size=16), showlegend=False,
                hovermode='closest', margin=dict(b=20,l=5,r=5,t=40),
                annotations=[ dict(
                    text="Plotly Python code: <a href='https://plot.ly/ipython-notebooks/network-graphs/'> https://plot.ly/ipython-notebooks/network-graphs/</a>",
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
        rslt['average_shortest_path_length']=nx.average_shortest_path_length(self.graph)
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
    parser.add_argument('--directed',required=True)
    parser.add_argument('--node_size',required=True)
    parser.add_argument('--edge_width',required=True)
    parser.add_argument('--metrics', nargs='+', required=False)


    args = parser.parse_args()
    
    network = Network(args.file,args.directed)
    network.draw_graph(args.layout, args.node_size, args.edge_width)

    if args.metrics:
        if 'approximation' in args.metrics:
            network.approximation()
        if 'assortativity' in args.metrics:
            network.assortativity()
        if 'centrality' in args.metrics:
            network.centrality()
        if 'cluster' in args.metrics:
            network.cluster()
        if 'component' in args.metrics:
            network.component()
        if 'distance' in args.metrics:
            network.distance()
        if 'hierarchy' in args.metrics:
            network.hierarchy()
        if 'googleMatrix' in args.metrics:
            network.googleMatrix()
        if 'path' in args.metrics:
            network.path()
        if 'tree' in args.metrics:
            network.tree()
        if 'triads' in args.metrics:
            network.triads()
        if 'vitality' in args.metrics:
            network.vitality()
        if 'traversal' in args.metrics:
            network.traversal()
