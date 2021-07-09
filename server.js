require("dotenv").config()
import http from "http";
import express from "express";
import logger from "morgan";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./schema";
import {getUser} from "./users/users.utils";

const apollo = new ApolloServer({
  resolvers,
  typeDefs,
  context: async (ctx) => {
    let token
    //http
    if (ctx.req) {
      token = ctx.req.headers.token
    }
    //websocket 
    else {
      token = ctx.connection.context.token
    }
    return {
      loggedInUser: await getUser(token),
    };
  },
});

const PORT = process.env.PORT;

const app = express();
app.use(logger("tiny"));
apollo.applyMiddleware({ app });
app.use("/static", express.static("uploads"));

const httpServer = http.createServer(app);
apollo.installSubscriptionHandlers(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀Server is running on http://localhost:${PORT}/graphql ✅`);
});