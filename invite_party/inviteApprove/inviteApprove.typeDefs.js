  
import { gql } from "apollo-server";

export default gql`
  type Mutation {
    inviteApprove(id: Int!): MutationResponse!
  }
`;