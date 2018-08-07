const graphql = require('graphql')
const axios = require('axios')
const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLList,
	GraphQLSchema,
	GraphQLNonNull
} = graphql

// Schema definitions
const CompanyType = new GraphQLObjectType({
	name: 'Company',
	fields: _ => ({
		id: { type: GraphQLString },
		name: { type: GraphQLString },
		description: { type: GraphQLString },
		users: {
			type: new GraphQLList(UserType), // <- Circular reference
			// parentValue is the instace of the company
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${ parentValue.id }/users`)
					.then (res => res.data);
			}
		}
	})
});

const UserType = new GraphQLObjectType({
	name: 'User',
	fields: _ => ({
		id: { type: GraphQLString },
		firstName: { type: GraphQLString },
		age: { type: GraphQLInt	},
		company: {
			type: CompanyType,
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${ parentValue.companyId }`)
					.then (res => res.data);
			}
		}
	})
});

// Root Query: entry point to the graph of data
const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		user: {
			type: UserType,
			args: {
				id: { type: GraphQLString }
			},
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/users/${ args.id }`).then(res => res.data);
			}
		},
		company: {
			type: CompanyType,
			args: {
				id: { type: GraphQLString }
			},
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${ args.id }`).then(res => res.data);
			}
		}
	}
});

const mutation = new GraphQLObjectType({
	name: 'Mutatioin',
	fields: {
		addUser: {
			type: UserType, // return type, not always the same
			args: {
				firstName: { type: new GraphQLNonNull(GraphQLString) },
				age: { type: new GraphQLNonNull(GraphQLInt) },
				companyId: { type: GraphQLString }
			},
			resolve(parentValue, args) {
				return axios.post('http://localhost:3000/users', {
					firstName: args.firstName,
					age: args.age
				}).then(res => res.data);
			}
		},

		deleteUser: {
			// It always expects to get back useful data
			// cant say "expect nothing back"
			type: UserType, // eventhough its gonna be null
			args: {
				id: { type: new GraphQLNonNull(GraphQLString) }
			},
			resolve(parentValue, args) {
				return axios.delete(`http://localhost:3000/users/${ args.id }`)
					.then(res => res.data);
			}
		},

		editUser: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLString) },
				firstName: { type: GraphQLString },
				age: { type: GraphQLInt },
				companyId: { type: GraphQLString }
			},
			resolve(parentValue, args) {
				return axios.patch(`http://localhost:3000/users/${ args.id }`, args).then(res => res.data);
			}
		}
	}
});

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation: mutation
});