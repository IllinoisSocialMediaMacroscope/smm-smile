var {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
} = require('graphql');

const twtExtendedEntity = module.exports = new GraphQLObjectType({
    name: 'twtExtendedEntity',
    description: 'entity of a tweet or user',
    fields: () => ({
        media: {type: new GraphQLList(twtMediaType)}
    })
});

const twtMediaType = require('./twtMediaType');
