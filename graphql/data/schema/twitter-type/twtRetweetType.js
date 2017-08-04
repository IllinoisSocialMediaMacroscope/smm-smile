var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt
} = require('graphql');

const retweetType = module.exports = new GraphQLObjectType({
	name        : 'retweet',
	description : 'Retweet of a tweet',
	fields      : () => ({
		/*--------------------------basic------------------------*/
		id:						{ type: GraphQLString },
		id_str: 				{ type: GraphQLString },
		text:					{ type: GraphQLString },
		created_at: 			{ type: GraphQLString },
		in_reply_to_status_id_str: 	{ type: GraphQLString },
		in_reply_to_user_id_str: 	{ type: GraphQLString },
		in_reply_to_screen_name: 	{ type: GraphQLString },
		favorite_count: 			{ type: GraphQLInt },
		retweet_count: 				{ type: GraphQLInt },
		/*--------------------------nested------------------------*/
		entities:					{ type: twtEntityType },
		retweeted_status: 			{ type: tweetType },
		user: 						{ type: twtUserType }
	  })
});

const twtUserType = require('./twtUserType');
const twtEntityType = require('./twtEntityType');
const tweetType = require('./twtTweetType');