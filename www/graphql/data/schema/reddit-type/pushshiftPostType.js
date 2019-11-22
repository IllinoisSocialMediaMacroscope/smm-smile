var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLFloat,
	GraphQLBoolean
} = require('graphql');
var redditAPI = require('../../../API/redditAPI');
//var replyLoader = require('../../../API/loader');

// const pushshiftMetaType = module.exports = new GraphQLObjectType({
// 	name:'pushshiftMeta',
// 	description:'',
// 	fields: () => ({
// 		_index: 	{type: GraphQLString},
// 		_type:		{type: GraphQLString},
// 		_id:		{type: GraphQLInt},
// 		_score:		{type: GraphQLInt},
// 		_source:	{type: pushshiftPostType}
// 	})
// });

const pushshiftPostType = module.exports = new GraphQLObjectType({
	name:'pushshiftPost',
	description:'',
	fields: () => ({
		author_name:			{type:GraphQLString,
								resolve: ({author})=>{return author}},
		author_flair_css_class:	{type:GraphQLString},
		author_flair_text:		{type:GraphQLString},
		brand_safe:				{type:GraphQLBoolean},
		can_mod_post:			{type:GraphQLBoolean},
		contest_mode:			{type:GraphQLString},
		created_utc:			{type:GraphQLString},
		domain:					{type:GraphQLString},
		id:						{type:GraphQLString},
		is_crosspostable:		{type:GraphQLBoolean},
		is_reddit_media_domain:	{type:GraphQLBoolean},
		is_self:				{type:GraphQLBoolean},
		is_video:				{type:GraphQLBoolean},
		locked:					{type:GraphQLBoolean},
		num_comments:			{type:GraphQLInt},
		num_crossposts:			{type:GraphQLInt},
		over_18:				{type:GraphQLBoolean},
		parent_whitelist_status:{type:GraphQLString},
		permalink:				{type:GraphQLString},
		full_link:				{type:GraphQLString},
		pinned:					{type:GraphQLBoolean},
		retrieved_on:			{type:GraphQLString},
		score:					{type:GraphQLInt},
		selftext:				{type:GraphQLString},
		stickied:				{type:GraphQLBoolean},
		spoiler:				{type:GraphQLBoolean},
		subreddit_display_name:	{type:GraphQLString,
								resolve: ({subreddit})=>{return subreddit}},
		subreddit_id:			{type:GraphQLString},
		subreddit_name_prefixed:{type:GraphQLString,
									resolve: ({subreddit})=>{return 'r/' + subreddit}},
		thumbnail:				{type:GraphQLString},
		title:					{type:GraphQLString},
		url:					{type:GraphQLString},
		whitelist_status:		{type:GraphQLString},		
	})
});
