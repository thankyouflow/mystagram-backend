import client from "../../client";
import { protectedResolver } from "../../users/users.utils";
import { READ_MESSAGE } from "../../constants";
import pubsub from "../../pubsub";

export default {
  Mutation: {
    readMessage: protectedResolver(async (_, { roomId }, { loggedInUser }) => {
      let participant = await client.participant.findFirst({
        where: {
          roomId,
          userId: loggedInUser.id
        },
        select: {
          id: true,
          unReadMessages: true,
          roomId: true
        },
      });
      if (participant.unReadMessages.length > 0) {
        await client.participant.update({
          where: {
            id: participant.id,
          },
          data: {
            unReadMessages: {
              set: []
            }
          },
        });

        pubsub.publish(READ_MESSAGE, { readUpdates: participant.unReadMessages });
      }
      return {
        ok: true,
      };
    }),
  },
};