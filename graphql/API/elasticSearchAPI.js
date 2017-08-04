var Promise = require('bluebird');
var AWS = require('aws-sdk');
require('dotenv').config();

function elasticSearchAPI(args){
	
	AWS.config.update({ region: 'us-west-2' });

	// create an elasticsearch client for your Amazon ES
	var client = require('elasticsearch').Client({
	  hosts: [ process.env.AWS_ES_HOST],
	  connectionClass: require('http-aws-es')
	});

	AWS.config.update({
	  credentials: new AWS.Credentials(process.env.AWS_ACCESS_TOKEN, process.env.AWS_ACCESS_SECRET)
	});	
	
	var param = {
		  index: 'twitter',
		  type: 'tweet',
		  from: (args['pageNum'] -1)* args['perPage'],
		  size: args['perPage'],
		  body: {
			query: {
				bool: {
					must:[
						{ match: { 'text':args['q']} }
					],
					filter:[]
				}
			}
		  }
	};
	
	// filter by date range
	if ('startDate' in args && 'endDate' in args){
		param['body']['query']['bool']['filter'].push(
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
		param['body']['query']['bool']['filter'].push(
			{geo_distance: {
							"distance": args['distance'],
							"coordinates.coordinates":[args['lon'],args['lat']]
						}
			});
	}
	
	// filter by followers count of the author
	if ('followers_count' in args){
		param['body']['query']['bool']['filter'].push(
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
		param['body']['query']['bool']['filter'].push(
			{range:  {
				"user.statuses_count":
					{ 
						"gte" : args['statuses_count']
					}
				}
			});
	}
	
	return new Promise((resolve,reject) =>{
		
		client.search(param).then(function (resp) {
			//console.log(resp.hits.hits);
			resolve(resp.hits.hits);
		}, function (err) {
			//console.log(err.message);
			reject(err);
		});
	});
}

module.exports = elasticSearchAPI;