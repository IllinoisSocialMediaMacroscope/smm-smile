var {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt
} = require('graphql');

const twtHashtagType = module.exports = new GraphQLObjectType({
    name:"twtHashtag",
    description:"array containing an object for every hashtag included in the Tweet body, and include an empty array if no hashtags are present",
    fields      : () => ({
        indices:{ type: new GraphQLList(GraphQLInt)},
        text:{ type: GraphQLString}
    })
});
