var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLFloat
} = require('graphql');

const esMetaType = module.exports = new GraphQLObjectType({
	name: 'esMeta',
	description: 'Return a elastic meta data',
	fields: ()=> ({
		_id:			{ type: GraphQLString },
		_type:			{ type: GraphQLString },
		_index:			{ type: GraphQLString },
		_score:			{ type: GraphQLFloat,
							description: 'elastic search document match score'
						},
		_source:		{ type: twtStreamType }
	})
});

const twtStreamType = new GraphQLObjectType({
	name: 'twtStream',
	description: 'Return a streaming tweet.',
	fields: ()=> ({
		/*--------------------------basic------------------------*/
		id: 			{ type: GraphQLString },
		id_str: 		{ type: GraphQLString },
		created_at: 	{ type: GraphQLString },
		text: 			{ type: GraphQLString },
		retweet_count: 	{ type: GraphQLInt },
		in_reply_to_user_id_str:	{ type: GraphQLString },
		in_reply_to_status_id_str: 	{ type: GraphQLString },
		in_reply_to_screen_name:	{ type: GraphQLString },
		timestamp_ms:				{ type: GraphQLString },
		mentions:					{ type: new GraphQLList(GraphQLString) },
		hashtags:					{ type: new GraphQLList(GraphQLString) },
		urls:						{ type: GraphQLString },
		/*--------------------------nested------------------------*/
		coordinates:	{ type: twtCoordinateType },
		user: 			{ type: twtUserType },
		user_mentions:	{ type: twtUserMentionType }
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