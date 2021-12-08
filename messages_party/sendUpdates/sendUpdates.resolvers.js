import { withFilter } from "apollo-server";
import client from "../../client";
import { SEND_MESSAGE } from "../../constants";
import pubsub from "../../pubsub";

export default {
  Subscription: {
    sendUpdates: {
      subscribe: async (root, args, context, info) => {
        return withFilter(
          () => pubsub.asyncIterator(SEND_MESSAGE),
          async ({ sendUpdates }, { }, { loggedInUser }) => {
            //front에서 알림 or room update 결정
              const roomParticipant = await client.room.findFirst({
                where: {
                  id: sendUpdates.roomId,
                },
                select: {
                  participant: true
                }
              })
              for (let e of roomParticipant.participant) {
                if (loggedInUser.id === e.userId){
                  return true
                }
              }
          }
        )(root, args, context, info);
      },
    },
  },
};