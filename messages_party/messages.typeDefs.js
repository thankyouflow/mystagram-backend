import { gql } from "apollo-server";

export default gql`
  type Message {
    id: Int!
    payload: String!
    user: User!
    room: Room!
    unReadCount: Int!
    unReaders:  [Participant]
    createdAt: String!
    updatedAt: String!
  }
  type Room {
    id: Int!
    unreadTotal: Int!
    users: [User]
    messages: [Message]
    participant:  [Participant]
    menu:       [Menu]
    party:     Party!  
    createdAt: String!
    updatedAt: String!
  }

  type Participant {
    id: Int!
    room: Room!
    group: Int
    userId: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Menu {
    id: Int!
    user: User!
    room: Room!
    party: Party!
    createdAt: String!
    updatedAt: String!
  }

  type Vote {
  id:        Int!   
  caption:   String!
  voteList:  [VoteList]
  end:       String!
  bocksu:    Int!
  anonymous: Int!
  createdAt: String!
  updatedAt: String!
}

type VoteList {
  id:        Int!     
  content:   String!
  vote:      Vote!     
  voteId:    Int!
  participants:     [Participant]
  group:     Int
  participantCount: Int!
  createdAt: String!
  updatedAt: String! 
}

`;

