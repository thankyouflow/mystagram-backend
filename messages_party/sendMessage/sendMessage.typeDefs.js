import { gql } from "apollo-server";

export default gql`
  type Mutation {
    sendMessage(photo: Upload, payload: String, roomId: Int, userId: Int, partyId:Int, type: Int!): MutationResponse!
  }
`;