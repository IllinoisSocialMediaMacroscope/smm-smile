var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLFloat,
	GraphQLBoolean
} = require('graphql');

const redditFlairType = module.exports = new GraphQLObjectType({
	name:'redditFlair',
	description:'',
	fields: () => ({
		flair_css_class:		{type:GraphQLString},
		flair_template_id:		{type:GraphQLString},
		flair_text_editable:	{type:GraphQLBoolean},
		flair_position:			{type:GraphQLString},
		flair_text:				{type:GraphQLString},
	})
});