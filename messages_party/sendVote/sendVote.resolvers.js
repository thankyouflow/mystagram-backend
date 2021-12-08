import client from "../../client";
import { SEND_MESSAGE } from "../../constants";
import pubsub from "../../pubsub";
import { protectedResolver } from "../../users/users.utils";
import { groupMaker } from "../../shared/shared.utils";

export default {
  Mutation: {
    sendVote: protectedResolver(
      async (_, { roomId, caption, end, bocksu, anonymous, contents, type }, { loggedInUser }) => {

        const vote = await client.vote.create({
          data: {
            caption,
            end,
            bocksu,
            anonymous,
          },
        });

        const room = await client.room.findUnique({
          where: {
            id: roomId,
          },
          select: {
            id: true,
            participant: true
          },
        });

        let connectParticipants = [];

        room.participant.forEach(e => {
          if (type === 1) {
            if (loggedInUser.id != e.userId) {
              connectParticipants.push({ id: e.id })
            }
          }
          else {
            connectParticipants.push({ id: e.id })
          }
        })


        let groupCount = await groupMaker(room.participant.length);

        const message = await makeMessage(roomId, connectParticipants, vote.id, type, loggedInUser)
        
        vote.voteList = [];
        for (let content of contents) {
          for (let i = 1; i <= groupCount; i++) {
            vote.voteList.push(await client.voteList.create({
              data: {
                content,
                group: i,
                vote: {
                  connect: {
                    id: vote.id,
                  },
                },
              }
            }))
          }
        }
        pubsub.publish(SEND_MESSAGE, { sendUpdates: message });

        return vote
      })
  }
}

async function makeMessage(roomId, connectParticipants, voteId, type, loggedInUser) {
  const message = await client.message.create({
    data: {
      type: 2,
      payload: String(voteId),
      room: {
        connect: {
          id: roomId,
        },
      },
      unReaders: {
        connect: connectParticipants,
      },
      ...(type === 1 &&
      {
        user: {
          connect: {
            id: loggedInUser.id,
          },
        }
      }),
      ...(type === 0 &&
      {
        user: {
          connect: {
            id: 2,
          },
        }
      }),
    },
  });
  return message
}