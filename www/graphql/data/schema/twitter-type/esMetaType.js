var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLFloat,
	GraphQLBoolean
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
		_source:		{ type: tweetType }
	})
});

const tweetType = require('./twtTweetType');