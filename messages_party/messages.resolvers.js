import client from "../client";

export default {
  Room: {
    users: ({ id }) => client.room.findUnique({ where: { id } }).users(),
    messages: ({ id }) =>
      client.message.findMany({
        where: {
          roomId: id,
        },
      }),
  },
  Message: {
    user: ({ id }) => client.message.findUnique({ where: { id } }).user(),
    unReadCount: async ({ id }) => {
      const countList = await client.message.findUnique({
        where: {
          id,
        },
        select: {
          unReaders: true,
        },
      }).unReaders()
      return countList.length
    },
  },
  VoteList: {
    participants: ({ id }) => client.voteList.findUnique({ where: { id } }).participants(),
    participantCount: async ({ id }) => {
      const participantList = await client.voteList.findUnique({
        where: {
          id,
        },
        select: {
          participants: true,
        },
      }).participants()
      return participantList.length
    },
  },
};