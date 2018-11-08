var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList
} = require('graphql');

const twitterQueryType = require('./twitterSchema');
const redditQueryType = require('./redditSchema');
const elasticSearchType = require('./elasticSearchSchema');
const crimsonQueryType = require('./crimsonHexagonSchema');

function wrapper(){
	return {}
}

const Query = new GraphQLObjectType({
	name: "Query",
	description: 'all social media ',
	fields:() => ({
		twitter:{
			type:twitterQueryType,
			resolve: () => wrapper()
			},
		reddit:{
			type: redditQueryType,
			resolve:() => wrapper()
		},
		elasticSearch:{
			type:elasticSearchType,
			resolve: () => wrapper()
		},
		crimsonQuery:{
			type:crimsonQueryType,
            resolve: () => wrapper()
		},
	})
});



module.exports = new GraphQLSchema({
	query:Query
})
