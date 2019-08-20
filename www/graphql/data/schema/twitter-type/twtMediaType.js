var {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt
} = require('graphql');

const twtMediaType = module.exports = new GraphQLObjectType({
    name: "twtMedia",
    fields: () => ({
        display_url: {type: GraphQLString},
        expanded_url: {type: GraphQLString},
        id: {type: GraphQLString},
        id_str: {type: GraphQLString},
        indices: {type: new GraphQLList(GraphQLInt)},
        media_url: {type: GraphQLString},
        media_url_https: {type: GraphQLString},
        // sizes:{},
        source_status_id: {type: GraphQLString},
        source_status_id_str: {type: GraphQLString},
        type: {type: GraphQLString},
        url: {type: GraphQLString}
    })
});
