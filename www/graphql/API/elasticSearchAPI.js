var Promise = require('bluebird');
var appendQuery = require('append-query');
var fetch = require('node-fetch');
//var AWS = require('aws-sdk');
//require('dotenv').config();

function elasticSearchAPI(args){
	
	//AWS.config.update({ region: 'us-west-2' });

	// create an elasticsearch client for your Amazon ES
	//var client = require('elasticsearch').Client({
	  //hosts: [ 'https://search-es-twitter-stream-yugu6rvjulzswrsj2y764qyy5i.us-west-2.es.amazonaws.com' ],
	  //connectionClass: require('http-aws-es')
	//});
	/*param = {};
	param['q'] = 'text:' + args['q'] +' AND lang:en';
	param['from'] = (args['pageNum'] -1)* args['perPage'];
	param['size'] = args['perPage'];
	
	// filter by date range
	if ('startDate' in args && 'endDate' in args){
		param['q'] += ' AND timestamp_ms:>=' + args['startDate'] + ' AND timestamp_ms:<=' + args['endDate'];
	}
	
	// filter by geolocation
	if ('distance' in args && 'lon' in args && 'lat' in args){
		param['q'] += ' AND geo_distance:distance:' + args['distance'] + ' AND geo_distance:coordinates.coordinates:[' + args['lon'] + ',' + args['lat'] + ']';
	}
	
	// filter by followers count of the author
	if ('followers_count' in args){
		param['q'] += ' AND user.followers_count:>=' + args['followers_count'];
	}
	
	// filter by author status count
	if ('statuses_count' in args){
		param['q'] += ' AND user.statuses_count:>=' + args['statuses_count'];
	}*/
	
	var param = {
		  from: (args['pageNum'] -1)* args['perPage'],
		  size: args['perPage'],
		  query: {
				bool: {
					must:[
						{ match: { 'text':args['q']} },
						{ match: {'lang':'en'}}
					],
					filter:[]
				}
			}
		};
	
	// filter by date range
	if ('startDate' in args && 'endDate' in args){
		param['query']['bool']['filter'].push(
			{range:  {
				"timestamp_ms":
					{ 
						"gte" : args['startDate'],
						"lte":  args['endDate']
						//"2017-07-24"
					}
				}
			});
	}
	
	// filter by geolocation
	if ('distance' in args && 'lon' in args && 'lat' in args){
		param['query']['bool']['filter'].push(
			{geo_distance: {
							"distance": args['distance'],
							"coordinates.coordinates":[args['lon'],args['lat']]
						}
			});
	}
	
	// filter by followers count of the author
	if ('followers_count' in args){
		param['query']['bool']['filter'].push(
			{range:  {
				"user.followers_count":
					{ 
						"gte" : args['followers_count']
					}
				}
			});
	}
	
	// filter by author status count
	if ('statuses_count' in args){
		param['query']['bool']['filter'].push(
			{range:  {
				"user.statuses_count":
					{ 
						"gte" : args['statuses_count']
					}
				}
			});
	}
	
	return new Promise((resolve,reject) =>{
		console.log(param);
		var endpoint = appendQuery('https://search-es-twitter-stream-yugu6rvjulzswrsj2y764qyy5i.us-west-2.es.amazonaws.com/twitter/tweet/_search/');
		var headers = {
			'Accept': 'application/json',
			'Content-Type':'application/json'
		}
		fetch(endpoint,{ method:'POST', headers:headers, body:JSON.stringify(param)}).then((res) =>{
			return res.json();
		}).then(function(json){
			console.log(JSON.stringify(json));
			resolve(json.hits.hits);
		}).catch((err) =>{
			//console.log(err);
			reject(err);
		});				
		
	});
}

module.exports = elasticSearchAPI;
