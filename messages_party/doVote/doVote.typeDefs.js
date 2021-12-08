import { gql } from "apollo-server";

export default gql`
  type Mutation {
    doVote(voteListid: Int!, roomId: Int!): MutationResponse!
  }
`;