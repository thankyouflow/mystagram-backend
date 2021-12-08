import client from "../../client";
import { protectedResolver } from "../../users/users.utils";

export default {
  Mutation: {
    doVote: protectedResolver(async (_, { voteListid, roomId }, { loggedInUser }) => {
      const participant = await client.participant.findFirst({
        where: {
          roomId,
          userId: loggedInUser.id,
        },
        select: {
          id: true,
          voteList: true
        }
      })
      if (!participant) return { ok: false, error: "permission denied" }
      const voteList = await client.voteList.findUnique({
        where: {
          id: voteListid,
        },
        select: {
          id: true,
          participants: true,
          vote: true
        }
      })
      let chcek = true;
      let bocksuCheck = [];
      for (let element of participant.voteList) {
        if (element.id === voteList.id) chcek = false
        if (element.voteId == voteList.vote.id && element.id !== voteList.id) bocksuCheck.push(element)
      }


      if (voteList.vote.bocksu === 1) {
        if (bocksuCheck) return { ok: false, error: "bocksu x" }
      }
      const result = await client.voteList.update({
        where: {
          id: voteListid,
        },
        data: {
          ...(chcek &&
          {
            participants: {
              connect: {
                id: participant.id,
              },
            }
          }),
          ...(!chcek &&
          {
            participants: {
              disconnect: {
                id: participant.id,
              },
            }
          }),
        }
      })
      if(result) return {ok: true}
      else return { ok: false, error: "update error" }
    }
    ),
  },
};