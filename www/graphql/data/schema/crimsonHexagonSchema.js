var {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLBoolean,
} = require('graphql');
var crimsonAPI = require('./../../API/crimsonAPI');

const crimsonQueryType = module.exports = new GraphQLObjectType({
    name:'crimsonQuery',
    description:'',
    fields: () => ({
        getPost:{
            type: new GraphQLList(crimsonPostType),
            args: {
                id: {type: GraphQLString},
                start: {
                    type: GraphQLString,
                    description: 'yyyy-mm-dd',
                    defaultValue: '2014-01-01',
                },
                end: {
                    type: GraphQLString,
                    description: 'yyyy-mm-dd',
                    defaultValue: '2018-01-01'
                },
                extendLimit:
                    {
                        type: GraphQLBoolean,
                        defaultValue: true
                    },
                fullContents:
                    {
                        type: GraphQLBoolean,
                        defaultValue: true
                    },
                geotagged:
                    {
                        type: GraphQLBoolean,
                        defaultValue: false
                    },
                filter:
                    {
                        type:GraphQLString
                    },
                twitter:
                    {
                        type:GraphQLString,
                        defaultValue:'off'
                    }
            },
            resolve: (_,args,context) => crimsonAPI(context, args=args)
        },
    }),
});

const crimsonPostType = require('./crimson-type/crimsonPostType');
