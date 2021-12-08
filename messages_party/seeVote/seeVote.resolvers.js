import client from "../../client";
import { protectedResolver } from "../../users/users.utils";

export default {
  Query: {
    seeVote: protectedResolver(async (_, { messageId, roomId }, { loggedInUser }) => {
      const participant = await client.participant.findFirst({
        where: {
          id: loggedInUser.id,
          roomId: roomId,
        },
      })
      if(!participant){
        return
      }
      const message = await client.message.findUnique({
        where: {
          id: messageId,
        },
        select: {
          payload: true
        }
      })

      let vote = await client.vote.findUnique({
        where: {
          id: Number(message.payload),
        },
        select: {
          id: true,
          voteList: true,
          caption: true,
          end: true,
          bocksu: true,
          anonymous: true,
        }
      })
      //투표가 마감되었으면 id 0으로 보냄
      if(new Date(vote.end) <= new Date()){
        vote.id = 0
      }
      vote.voteList = vote.voteList.filter(function(element){
        return element.group === participant.group;
    });
      return vote
    }
    ),
  },
};