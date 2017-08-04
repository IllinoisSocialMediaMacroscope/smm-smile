var {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt
} = require('graphql');

const twtGeoType = module.exports = new GraphQLObjectType({
	name: 'twtGeo',
	description: `Search for places that can be attached to a statuses/update. 
	Given a latitude and a longitude pair, an IP address, or a name, this request 
	will return a list of all the valid places that can be used as the place_
	id when updating a status.`,
	fields : ()=> ({
		/*--------------------------basic------------------------*/
		attributes: {type: GraphQLString },
		country:	{type: GraphQLString },
		country_code: {type: GraphQLString },
		full_name:	{type: GraphQLString },
		id: 		{type: GraphQLString },
		name:		{type: GraphQLString },
		place_type: {type: GraphQLString },
		url: 		{type: GraphQLString },
		/*--------------------------nested------------------------*/
		contained_within: {type: new GraphQLList(twtGeoType) }
	})
});

