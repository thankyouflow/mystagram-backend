
import client from "../../client";
import { protectedResolver } from "../../users/users.utils";
import { SEND_INVITE } from "../../constants";
import pubsub from "../../pubsub";

export default {
  Mutation: {
    inviteDeny: protectedResolver(
      async (_, { id }, { loggedInUser }) => {
        let invite = await client.invite.findUnique({
          where: {
            id,
          },
          select: {
            targetId: true,
            partyId: true,
          },
        });
        if (invite.targetId != loggedInUser.id){
          return { ok: false, msg: "permission denied" }
        }
        invite = await client.invite.delete({
          where: {
            id,
          },
        });

        if(invite) {
          return {ok: true}
        }
        else return { ok: false, msg: "delete error" }
      }
    ),
  },
};