  
import { gql } from "apollo-server";

export default gql`
  type Mutation {
    inviteDeny(id: Int!): MutationResponse!
  }
`;