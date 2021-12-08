import { gql } from "apollo-server";

export default gql`
  type Mutation {
    sendVote(roomId: Int, caption: String, end: String, bocksu: Int, anonymous: Int, contents: [String], type: Int ): Vote!
  }
`;
//type 0 운영자 1 유저
