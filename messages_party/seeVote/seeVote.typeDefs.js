import { gql } from "apollo-server";

export default gql`
  type Query {
    seeVote(messageId: Int!, roomId: Int!): Vote
  }
`;