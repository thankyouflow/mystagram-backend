import { gql } from "apollo-server";

export default gql`
  type Query {
    seeVoteList(id: Int!): VoteList
  }
`;