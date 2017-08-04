var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLFloat,
	GraphQLBoolean
} = require('graphql');
var redditAPI = require('./../../API/redditAPI');

const redditQueryType = module.exports = new GraphQLObjectType({
	name:'redditQuery',
	description:'',
	fields: () => ({
		searchSubredditTopics:{
			type:new GraphQLList(subreddditType),
			args:{
				query:{type:GraphQLString},
			},
			description:'Searches subreddits by topic.Returns An Array of subreddit objects corresponding to the search results',
			resolve: (_,args,context) => redditAPI(context, resolveName='searchSubredditTopics',id='',args=args)
		},
		searchSubreddits:{
			type:new GraphQLList(subreddditType),
			args:{
				query:{type:GraphQLString}
			},
			description:'Searches subreddits by title and description.Returns A Listing containing Subreddits',
			resolve: (_,args,context) => redditAPI(context, resolveName = 'searchSubreddits', id='',args=args)
		},
		search:{
			type:new GraphQLList(redditLinkType),
			description:'Conducts a search of reddit submissions.Returns:A Listing containing the search results.',
			args:{	query:		{type:GraphQLString},
					time:		{type:GraphQLString,
									defaultValue:'all',
									description:'hour, day, week, month, year, all'},
					subreddit:	{type:GraphQLString},
					restrictSr:	{type:GraphQLBoolean,
									defaultValue:false,
									description:'Restricts search results to the given subreddit'},
					sort:		{type:GraphQLString,
									defaultValue: 'relevance',
									description:'relevance, hot, top, new, comments'},
					syntax:		{type:GraphQLString,
									description:'cloudsearch, lucene, plain'},
					count:		{type:GraphQLInt,
									defaultValue: 0}
					},
			resolve: (_,args,context) => redditAPI(context, resolveName = 'search', id='', args = args)
		},
		
		getCompleteReplies:{
			type:new GraphQLList(redditCommentType),
			description:'given a submission id, get all the content and replies within.',
			args:{ id:	{type:GraphQLString}},
			resolve:(_,args,context) => redditAPI(context, resolveName='getCompleteReplies',id=args['id'],args='')
		},
		
		getNewComments:{
			type:new GraphQLList(redditCommentType),
			description:'Gets a Listing of new comments.Return A Listing containing the retrieved comments.',
			args:{
					subredditName:	{type:GraphQLString},
					extra:			{type:GraphQLInt,
										defaultValue:0,
										description:'for fetchMore'
									},
			},
			resolve: (_,args,context) => redditAPI(context, resolveName = 'getNewComments', id='', args = args)
		},
		searchSubredditNames:{
			type:new GraphQLList(GraphQLString),
			args:{
				query:{type:GraphQLString},
				exact:{type:GraphQLBoolean,
						defaultValue:false},
				includeNsfw:{type:GraphQLBoolean,
							defaultValue:true},
			},
			description:'Searches for subreddits given a query. Returns An Array containing subreddit names',
			resolve: (_,args,context) => redditAPI(context, resolveName='searchSubredditNames', id='', args=args)
		},
		getPopularSubreddits:{
			type:new GraphQLList(subreddditType),
			description:'Gets a list of subreddits, arranged by popularity.Returns A Listing containing Subreddits',
			args:{
				options:	{type:GraphQLInt,defaultValue:0},
				extra:		{type:GraphQLInt,
									defaultValue:0,
									description:'for fetchMore'
								},
			},
			resolve: (_,args,context) => redditAPI(context, resolveName = 'getPopularSubreddits',id='',args=args)
		},
		
		getNewSubreddits:{
			type:new GraphQLList(subreddditType),
			description:'Gets a list of subreddits, arranged by age. Returns A Listing containing Subreddits',
			args:{
				options:	{type:GraphQLInt,defaultValue:0},
				extra:		{type:GraphQLInt,
									defaultValue:0,
									description:'for fetchMore'
								},
			},
			resolve: (_,args,context) => redditAPI(context, resolveName = 'getNewSubreddits',id='',args=args)
		},
		
		getGoldSubreddits:{
			type:new GraphQLList(subreddditType),
			description:'Gets a list of gold-exclusive subreddits. Returns A Listing containing Subreddits',
			args:{
				options:	{type:GraphQLInt,defaultValue:0},
				extra:		{type:GraphQLInt,
									defaultValue:0,
									description:'for fetchMore'
								},
			},
			resolve: (_,args,context) => redditAPI(context, resolveName = 'getGoldSubreddits',id='',args=args)
		},
		
		getDefaultSubreddits:{
			type:new GraphQLList(subreddditType),
			description:'Gets a list of default subreddits. Returns A Listing containing Subreddits',
			args:{
				options:	{type:GraphQLInt,defaultValue:0},
				extra:		{type:GraphQLInt,
									defaultValue:0,
									description:'for fetchMore'
								},
			},
			resolve: (_,args,context) => redditAPI(context, resolveName = 'getDefaultSubreddits',id='',args=args)
		},
		
		getHot:{
			type:new GraphQLList(redditLinkType),
			description:'Gets a Listing of hot posts. Return A Listing containing the retrieved submissions.',
			args:{
					subredditName:	{type:GraphQLString},
					options:		{type:GraphQLInt, defaultValue:0},
					extra:			{type:GraphQLInt,
										defaultValue:0,
										description:'for fetchMore'
									},
			},
			resolve: (_,args,context) => redditAPI(context, resolveName = 'getHot', id='', args = args)
		},
		getNew:{
			type:new GraphQLList(redditLinkType),
			description:'Gets a Listing of new posts. Return A Listing containing the retrieved submissions.',
			args:{
					subredditName:	{type:GraphQLString},
					options:		{type:GraphQLInt, defaultValue:0},
					extra:			{type:GraphQLInt,
										defaultValue:0,
										description:'for fetchMore'
									},
			},
			resolve: (_,args,context) => redditAPI(context, resolveName = 'getNew', id='', args = args)
		},
		getTop:{
			type:new GraphQLList(redditLinkType),
			description:'Gets a Listing of top posts. Return A Listing containing the retrieved submissions.',
			args:{
					subredditName:	{type:GraphQLString},
					options:		{type:GraphQLInt, defaultValue:0},
					extra:			{type:GraphQLInt,
										defaultValue:0,
										description:'for fetchMore'
									},
			},
			resolve: (_,args,context) => redditAPI(context, resolveName = 'getTop', id='', args = args)
		},
		getControversial:{
			type:new GraphQLList(redditLinkType),
			description:'Gets a Listing of controversial posts. Return A Listing containing the retrieved submissions.',
			args:{
					subredditName:	{type:GraphQLString},
					options:		{type:GraphQLInt, defaultValue:0},
					extra:			{type:GraphQLInt,
										defaultValue:0,
										description:'for fetchMore'
									},
			},
			resolve: (_,args,context) => redditAPI(context, resolveName = 'getControversial', id='', args = args)
		},
		getRising:{
			type:new GraphQLList(redditLinkType),
			description:'Gets a Listing of rising posts. Return A Listing containing the retrieved submissions.',
			args:{
					subredditName:	{type:GraphQLString},
					options:		{type:GraphQLInt, defaultValue:0},
					extra:			{type:GraphQLInt,
										defaultValue:0,
										description:'for fetchMore'
									},
			},
			resolve: (_,args,context) => redditAPI(context, resolveName = 'getRising', id='', args = args)
		},
		
	})
});

const subreddditType = require('./reddit-type/subredditType');
const redditLinkType = require('./reddit-type/redditLinkType');
const redditCommentType = require('./reddit-type/redditCommentType');