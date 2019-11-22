var {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
} = require('graphql');

const twtEntityType = module.exports = new GraphQLObjectType({
    name: 'twtEntity',
    description: 'entity of a tweet or user',
    fields: () => ({
        /*--------------------------basic------------------------*/
        urls: {type: new GraphQLList(twtUrlType)},
        hashtags: {type: new GraphQLList(twtHashtagType)},
        media: {type: new GraphQLList(twtMediaType)},
        user_mentions: {type: new GraphQLList(twtUserType)},
    })
});

const twtUserType = require('./twtUserType');
const twtMediaType = require('./twtMediaType');
const twtHashtagType = require('./twtHashtagType');
const twtUrlType = require('./twtUrlType');
