var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt
} = require('graphql');

var twitterAPI = require('../../../API/twitterAPI');

const twtUserType = module.exports = new GraphQLObjectType({
	name: 'twtUser',
	description: 'Return a twitter user.',
	fields: () => ({
		/*--------------------------basic------------------------*/
		author_id:				{ type: GraphQLString,
									resolve:({id}) =>{ return id} },
		author_id_str: 			{ type: GraphQLString,
									resolve:({id_str}) =>{ return id_str} },
		name:					{ type: GraphQLString },
		screen_name:			{ type: GraphQLString },
		description: 			{ type: GraphQLString },
		author_created_at:		{ type: GraphQLString,
									resolve:({created_at}) =>{ return created_at} },
		profile_image_url:		{ type: GraphQLString },
		url:					{ type: GraphQLString },
		location: 				{ type: GraphQLString },
		tweets_count: 			{ type: GraphQLInt,
									resolve: ({ statuses_count}) => {return statuses_count}	},
		followers_count : 		{ type: GraphQLInt },
		friends_count :			{ type: GraphQLInt },
		listed_count: 			{ type: GraphQLInt },
		favourites_count: 		{ type: GraphQLInt },
		statuses_count	: 		{type: GraphQLInt },
		time_zone:				{ type: GraphQLString },
		/*--------------------------nested------------------------*/
		timeline:	{
						type: new GraphQLList(tweetType),
						args:{count:{type:GraphQLInt,defaultValue:200}},
						description: 'Get the timeline of current User',
						resolve:({id_str},args,context) =>twitterAPI(context,resolveName = 'fetchTimeline', id=id_str,args=args)
					},
		friends:	{
						type: new GraphQLList(twtUserType),
						args:{count:{type:GraphQLInt,defaultValue:3}},
						description: 'Get a list of followees of current User',
						resolve:({id_str},args,context) => twitterAPI(context,resolveName = 'fetchFriend', id=id_str,args=args)
					},
		followers:	{	
						type: new GraphQLList(twtUserType),
						args:{count:{type:GraphQLInt,defaultValue:3}},
						description: 'Get a list of followers of current User',
						resolve:({id_str},args,context) => twitterAPI(context,resolveName = 'fetchFollower', id=id_str,args=args)
					}
	})
});

const tweetType = require('./twtTweetType');