const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schema/schema');
const app = express();

// detect GraphQL requests
app.use('/graphql', expressGraphQL({
	schema,
	graphiql: true // dev only
}));

app.listen(4000, () => {
	console.log('Listening on port: 4000')
});