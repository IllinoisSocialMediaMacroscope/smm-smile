var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLFloat,
	GraphQLBoolean
} = require('graphql');

const pushshiftCommentType = module.exports = new GraphQLObjectType({
	name:'pushshiftComment',
	description:'',
	fields: () => ({
		comment_author_name:	{type:GraphQLString,
									resolve:({author})=>{return author}},
		author_flair_css_class:	{type:GraphQLString},
		author_flair_text:		{type:GraphQLString},
		body:					{type:GraphQLString},
		comment_created:		{type:GraphQLString,
									resolve:({created_utc}) => {return created_utc}},
		id:						{type:GraphQLString},
		link_id:				{type:GraphQLString},
		parent_id:				{type:GraphQLString},
		comment_score:			{type:GraphQLInt,
									resolve: ({score}) => {return score}},
		subreddit_display_name:	{type:GraphQLString,
									resolve:({subreddit})=>{return subreddit}},
		subreddit_name_prefixed:{type:GraphQLString,
									resolve:({subreddit}) => {return 'r/' + subreddit}},
		subreddit_id:			{type:GraphQLString},
	})
});