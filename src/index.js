require('dotenv').config()
const { ApolloServer } = require('apollo-server');
const { application } = require('./schema/index.js');
const {models} = require('./sequelize');

const schema = application.createSchemaForApollo();

const server = new ApolloServer({
  schema,
  context: ({req}) => {
    const token = req.headers.authorization || ''
    return {models, token}
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});