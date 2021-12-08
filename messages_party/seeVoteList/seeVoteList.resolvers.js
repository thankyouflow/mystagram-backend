import client from "../../client";
import { protectedResolver } from "../../users/users.utils";

export default {
  Query: {
    seeVoteList: protectedResolver((_, { id }, { loggedInUser }) =>
     client.voteList.findUnique({
      where: {
        id,
      },
    })
    ),
  },
};