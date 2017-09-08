var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLBoolean,
	GraphQLUnionType
} = require('graphql');


const redditCommentType = require('./redditCommentType');
const redditLinkType = require('./redditLinkType');

const resolveType = (data) => {
	if (data.body){
		return redditCommentType;
	}else{
		return redditLinkType;
	}
};

const redditOverviewType = module.exports = new GraphQLUnionType({
	name: 'redditOverview',
	description: `comment | link`,
	types: [redditCommentType, redditLinkType],
	resolveType: resolveType
});
