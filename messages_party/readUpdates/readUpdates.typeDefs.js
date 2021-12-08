import { gql } from "apollo-server";

export default gql`
  type Subscription {
    readUpdates(id: Int!): [Message]
  }
`;