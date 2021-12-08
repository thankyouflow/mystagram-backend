
import client from "../../client";
import { protectedResolver } from "../../users/users.utils";

export default {
  Mutation: {
    inviteApprove: protectedResolver(
      async (_, { id }, { loggedInUser }) => {
        const invite = await client.invite.findUnique({
          where: {
            id,
          },
          select: {
            targetId: true,
            partyId: true,
          },
        });
        if (invite.targetId != loggedInUser.id) {
          return { ok: false, msg: "permission denied" }
        }

        const party = await client.party.findUnique({
          where: {
            id: invite.partyId
          },
          select: {
            id: true,
            roomId: true,
            room: {
              select: {
                participants: true
              },
            },
            people: true,
            when: true,
            magam: true,
          },
        });

        const user = await client.user.findUnique({
          where: {
            id: loggedInUser.id,
          },
          select: {
            invitePermission: true,
            participants: true,
          },
        });

        if (party.magam) {
          return { ok: false, msg: "already closeed party" }
        }

        if (user.participants.filter(function (element) {
          return element.roomId === party.roomId;
        })) {
          return { ok: false, msg: "already attended party" }
        }

        if (party.room.participants.length >= party.people) {
          return { ok: false, msg: "full participants" }
        }
        const participant = await client.participant.create({
          data: {
            room: {
              connect:
              {
                id: party.roomId,
              },
            },
            user: {
              connect:
              {
                id: loggedInUser.id,
              },
            },
          },
        });

        if (participant) {
          await client.invite.delete({
            where: {
              id,
            },
          });
          return { ok: true, msg: room.id }
        }
        else return { ok: false, msg: "create error" }
      }
    ),
  },
};