var {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt
} = require('graphql');

const twtUrlType = module.exports = new GraphQLObjectType({
    name: 'twtUrl',
    fields: () => ({
        display_url: {type: GraphQLString},
        expanded_url: {type: GraphQLString},
        indices: {type: new GraphQLList(GraphQLInt)},
        url: {type: GraphQLString},
        // unwound: {}
    })
});
