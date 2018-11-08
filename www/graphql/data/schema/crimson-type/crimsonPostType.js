var {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLFloat
} = require('graphql');

var twitterAPI = require('./../../../API/twitterAPI');

const crimsonPostType = module.exports = new GraphQLObjectType({
    name:'crimsonPost',
    description:'',
    fields: () => ({
        assignedCategoryId:	{type:GraphQLString},
        assignedEmotionId:	{type:GraphQLString},
        author:	            {type:GraphQLString},
        categoryScores:	    {type: new GraphQLList(crimsonCategoryType)},
        contents:           {type:GraphQLString},
        date:               {type:GraphQLString},
        emotionScores:      {type: new GraphQLList(crimsonEmotionType)},
        country:            {type:GraphQLString,
                        resolve: ({geolocation}) => {
            if (geolocation !== undefined) {
                return geolocation.country;
            }else {
                return null;
            }
        }},
        country_id:        {type:GraphQLString,
            resolve: ({geolocation}) => {
                if (geolocation !== undefined) {
                    return geolocation.id;
                }else {
                    return null;
                }
            }},
        country_name:       {type:GraphQLString,
            resolve: ({geolocation}) => {
                if (geolocation !== undefined) {
                    return geolocation.name;
                }else {
                    return null;
                }
            }},
        language:           {type:GraphQLString},
        location:           {type:GraphQLString},
        title:              {type:GraphQLString},
        type:               {type:GraphQLString},
        url:                {type:GraphQLString}
    })
});

const crimsonCategoryType = new GraphQLObjectType({
    name:'crimsonCategory',
    description:'',
    fields: () => ({
        categoryId: {type:GraphQLString},
        categoryName: {type:GraphQLString},
        score: {type:GraphQLFloat}
    })
});

const crimsonEmotionType = new GraphQLObjectType({
    name:'crimsonEmotion',
    description:'',
    fields: () => ({
        emotionId: {type:GraphQLString},
        emotionName: {type:GraphQLString},
        score: {type:GraphQLFloat}
    })
});


const tweetType = require('./../twitter-type/twtTweetType');
