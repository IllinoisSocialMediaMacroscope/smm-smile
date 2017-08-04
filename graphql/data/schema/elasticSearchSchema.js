var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLFloat
} = require('graphql');

var elasticSearchAPI = require('./../../API/elasticSearchAPI');

// root
const elasticSearchType = module.exports = new GraphQLObjectType({
	name:'elasticSearch',
	description:'Query our own elastic search database. Right now it stores twitter streaming data',
	fields: () => ({
		streamTweet:{
			type: new GraphQLList(esMetaType),
			args:{
				q:		{ 	type:GraphQLString,
							description:'The search query to run against people search.' 
						},
				perPage:{ 	type:GraphQLInt,
							defaultValue:3
						},
				pageNum: 	{ 	type: GraphQLInt,
								defaultValue:1
							},
				startDate:  {
								type:GraphQLString,
								description:"yyyy-mm-dd",
								//defaultValue: 'now-7d/d',
							},
				endDate:	{
								type:GraphQLString,
								description:"yyyy-mm-dd",
								//defaultValue:'now/d'
							},
				lat:		{
								type:GraphQLFloat,
								description:"latitude of the tweet"
							},
				lon:		{
								type:GraphQLFloat,
								description:"longitude"
							},
				distance:	{
								type:GraphQLString,
								description:"acceptable unit: mi,yd,ft,in,km,m,cm,mm,nmi"
							},
				followers_count:{
									type:GraphQLInt,
									description: "author\'s followers number"
								},
				statuses_count:	{
									type:GraphQLInt,
									description:"author\'s statuses count"
								}
			},
			resolve: (_,args) => elasticSearchAPI(args=args)
		}
		
	})
});

const esMetaType = require('./twitter-type/esMetaType');