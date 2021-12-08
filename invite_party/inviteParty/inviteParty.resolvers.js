
import client from "../../client";
import { protectedResolver } from "../../users/users.utils";
import { SEND_INVITE } from "../../constants";
import pubsub from "../../pubsub";

export default {
  Mutation: {
    inviteParty: protectedResolver(
      async (_, { targetId, partyId }, { loggedInUser }) => {
        const party = await client.party.findUnique({
          where: {
            id: partyId,
          },
          select: {
            userId: true,
            roomId: true,
          },
        });
        if (party.userId != loggedInUser.id){
          return { ok: false, msg: "permission denied" }
        }
        const user = await client.user.findUnique({
          where: {
            id: targetId,
          },
          select: {
            invitePermission: true,
            participants: true,
          },
        });

        if (!user.invitePermission){
          return { ok: false, msg: "invite permission denied" }
        }
        if(user.participants.filter(function(element){
          return element.roomId === party.roomId;
        })){
          return { ok: false, msg: "already attended party" } 
        }
        const invite = await client.invite.create({
          data: {
            userId : loggedInUser.id,
            target: {
              connect: {
                id: targetId
              }
            },
            party: {
              connect: {
                id: partyId
              }
            }
          },
        });
        if(invite) {
          pubsub.publish(SEND_INVITE, { inviteAlarm: invite });
          return {ok: true}
        }
        else return { ok: false, msg: "create error" }
      }
    ),
  },
};