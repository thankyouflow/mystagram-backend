import { ApolloServer, gql } from "apollo-server";
import {typeDefs, resolvers} from './schema.js'


const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server
  .listen()
  .then(() => console.log("Server is running on http://localhost:4000/"));