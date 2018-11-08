var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt
} = require('graphql');

const twtEntityType = module.exports = new GraphQLObjectType({
	name        : 'twtEntity',
	description : 'entity of a tweet or user',
	fields      : () => ({
		/*--------------------------basic------------------------*/
		urls:				{	type: new GraphQLList(GraphQLString),
								resolve: ({urls}) => { 
														var url_list = new Array();
														urls.forEach(function(url){
															url_list.push(url['url']);
														});
														return url_list
													}
							},
		hashtags:			{ 	type: new GraphQLList(GraphQLString),
								resolve: ({hashtags}) => { 
															var tag_list = new Array();
															hashtags.forEach(function(hashtag){
																tag_list.push(hashtag['text']);
															});
															return tag_list 
														}
							},
		user_mentions:		{ type: new GraphQLList(twtUserType)},
	  })
});

const twtUserType = require('./twtUserType');