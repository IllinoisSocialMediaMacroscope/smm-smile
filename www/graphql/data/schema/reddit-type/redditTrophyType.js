var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLFloat,
	GraphQLBoolean
} = require('graphql');

const redditTrophyType = module.exports = new GraphQLObjectType({
	name:'redditTrophy',
	description:'',
	fields: () => ({
		icon_70:		{type:GraphQLString},
		name:			{type:GraphQLString},
		url:			{type:GraphQLString},
		icon_40:		{type:GraphQLString},
		award_id:		{type:GraphQLString},
		id:				{type:GraphQLString},
		description:	{type:GraphQLString},
	})
});