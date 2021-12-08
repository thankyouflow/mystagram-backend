import { gql } from "apollo-server";

export default gql`
  type Mutation {
    readMessage(roomId: Int!): MutationResponse!
  }
`;