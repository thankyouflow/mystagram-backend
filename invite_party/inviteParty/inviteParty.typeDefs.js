  
import { gql } from "apollo-server";

export default gql`
  type Mutation {
    inviteParty(targetId: Int!, partyId: Int!): MutationResponse!
  }
`;