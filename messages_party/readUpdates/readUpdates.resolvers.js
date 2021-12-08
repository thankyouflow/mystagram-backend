import { withFilter } from "apollo-server";
import client from "../../client";
import { READ_MESSAGE } from "../../constants";
import pubsub from "../../pubsub";

export default {
  Subscription: {
    readUpdates: {
      subscribe: async (root, args, context, info) => {
        const room = await client.room.findFirst({
          where: {
            id: args.id,
            users: {
              some: {
                id: context.loggedInUser.id,
              },
            },
          },
          select: {
            id: true,
          },
        });
        if (!room) {
          throw new Error("You shall not see this.");
        }
        return withFilter(
          () => pubsub.asyncIterator(READ_MESSAGE),
          async ({ readUpdates }, { id }, { loggedInUser }) => {
            const checkData = readUpdates[0]
              if (checkData.roomId === id) {
                const room = await client.room.findFirst({
                  where: {
                    id,
                    users: {
                      some: {
                        id: loggedInUser.id,
                      },
                    },
                  },
                  select: {
                    id: true,
                  },
                });
                if (!room) {
                  return false;
                }
                return true;
              }
          }
        )(root, args, context, info);
      },
    },
  },
};