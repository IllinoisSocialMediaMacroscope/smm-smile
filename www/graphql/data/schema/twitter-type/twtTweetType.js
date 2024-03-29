var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLBoolean,
	GraphQLFloat,
} = require('graphql');

var twitterAPI = require('../../../API/twitterAPI');

const tweetType = module.exports = new GraphQLObjectType({
	name: 'tweet',
	description: 'Return a tweet.',
	fields : ()=> ({
		/*--------------------------basic------------------------*/
		id: 			{ type: GraphQLString },
		id_str: 		{ type: GraphQLString },
		created_at: 	{ type: GraphQLString },
		text: 			{ type: GraphQLString, resolve: ({full_text}) => { return full_text; }},
        display_text_range: {type: GraphQLString, resolve: ({display_text_range}) => {
        	if (display_text_range !== undefined){
                return "[" + display_text_range.join(",") + "]";
			}
			else{
        		return "[]";
			}
		}},
		retweet_count: 	{ type: GraphQLInt },
		favorite_count:	{ type: GraphQLInt },  
		retweeted:		{ type: GraphQLBoolean },
		favorited:		{ type: GraphQLBoolean },
		possibly_sensitive: { type: GraphQLBoolean },
		truncated:		{ type: GraphQLBoolean },
		lang:			{ type: GraphQLString },
		in_reply_to_user_id_str:	{ type: GraphQLString },
		in_reply_to_status_id_str: 	{ type: GraphQLString },
		in_reply_to_screen_name:	{ type: GraphQLString },
		timestamp_ms:				{ type: GraphQLString },
		mentions:					{ type: new GraphQLList(GraphQLString) },
		hashtags:					{ type: new GraphQLList(GraphQLString) },
		urls:						{ type: new GraphQLList(GraphQLString) },
		is_quote_status:			{ type: GraphQLBoolean },
		emoticons :					{ type: GraphQLString },
		source :					{ type: GraphQLString },
		sentiments:					{ type: GraphQLString },
		filter_level:				{ type: GraphQLString },
		/*--------------------------nested------------------------*/
		place:			{ type: twtPlaceType	},
		coordinates:	{ type: twtCoordinateType },
		user_mentions:	{ type: twtUserMentionType },
		user: 			{ type: twtUserType },
		entities:		{ type: twtEntityType },
        extended_entities: { type: twtExtendedEntityType },
		retweet: 		{
							type: new GraphQLList(retweetType),
							description: 'Get a list of retweets',
							args: {count:{type:GraphQLInt,defaultValue:3}},
							resolve: ({id_str},args,context) => twitterAPI(context,resolveName = 'fetchRetweet', id=id_str,args=args)
						}
	})
});

const twtPlaceType = new GraphQLObjectType({
	name: 'twtPlace',
	description: 'return a place type',
	fields: () => ({
		country_code:	{type: GraphQLString},
		full_name:		{type: GraphQLString},
		country:		{type: GraphQLString},
		id:				{type: GraphQLString},
		name:			{type: GraphQLString},
		url:			{type: GraphQLString},
		place_type: 	{type: GraphQLString},
		bounding_box_type:	{type: GraphQLString,
								resolve:({bounding_box}) =>{ return bounding_box.type} },
		bounding_box_coordinates: {type: GraphQLString,
								resolve:({bounding_box}) =>{ return bounding_box.coordinates} },
	})
});
		
const twtUserMentionType = new GraphQLObjectType({
	name:'twtUserMention',
	description: 'return a user mention type',
	fields: () => ({
		id:			{type: new GraphQLList(GraphQLInt)},
		id_str:		{type:new GraphQLList(GraphQLString)},
		name:		{type:new GraphQLList(GraphQLString)},
		screen_name:{type:new GraphQLList(GraphQLString)},
	})
});

const twtCoordinateType = new GraphQLObjectType({
	name:'twtCoordinateType',
	description:'return a coordinate',
	fields: () => ({
		type:	{type:GraphQLString},
		lon: 	{type:GraphQLFloat,
					resolve: ({coordinates}) => {return coordinates[0]; }},
		lat:	{type:GraphQLFloat,
					resolve: ({coordinates}) => {return coordinates[1]; }},
	})
});

const twtUserType = require('./twtUserType');
const twtEntityType = require('./twtEntityType');
const twtExtendedEntityType = require('./twtExtendedEntityType');
const retweetType = require('./twtRetweetType');
