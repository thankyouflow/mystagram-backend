import { withFilter } from "apollo-server";
import { SEND_INVITE } from "../../constants";
import pubsub from "../../pubsub";

export default {
  Subscription: {
    inviteAlarm: {
      subscribe: async (root, args, context, info) => {
        return withFilter(
          () => pubsub.asyncIterator(SEND_INVITE),
          async ({ inviteAlarm }, { }, { loggedInUser }) => {
            if (loggedInUser.id === inviteAlarm.targetId){
              return true
            }
          }
        )(root, args, context, info);
      },
    },
  },
};