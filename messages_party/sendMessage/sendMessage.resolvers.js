import client from "../../client";
import { SEND_MESSAGE } from "../../constants";
import pubsub from "../../pubsub";
import { protectedResolver } from "../../users/users.utils";
import { groupMaker } from "../../shared/shared.utils";
import { uploadToS3 } from "../../shared/shared.utils";

export default {
  Mutation: {
    sendMessage: protectedResolver(
      async (_, { photo, payload, roomId, userId, partyId, type }, { loggedInUser }) => {
        let room = null;
        let participant = null;
        let connectParticipants = [];

        if (userId) {
          const user = await client.user.findUnique({
            where: {
              id: userId,
            },
            select: {
              id: true,
            },
          });
          if (!user) {
            return {
              ok: false,
              msg: "This user does not exist.",
            };
          }

          room = await client.room.create({ data:{} });

          participant = await client.participant.create({
            data: {
              user: {
                connect:
                {
                  id: userId,
                },
              },
              room: {
                connect:
                {
                  id: room.id,
                },
              },
            },
          });

          const me = await client.participant.create({
            data: {
              user: {
                connect:
                {
                  id: loggedInUser.id,
                },
              },
              room: {
                connect:
                {
                  id: room.id,
                },
              },
            },
          });

          connectParticipants = [{id : participant.id}]
        } else if (roomId) {
          room = await client.room.findUnique({
            where: {
              id: roomId,
            },
            select: {
              id: true,
              participants: true
            },
          });
          if (!room) {
            return {
              ok: false,
              msg: "Room not found.",
            };
          }
          room.participants.forEach(e => {
            if(loggedInUser.id != e.userId){
              connectParticipants.push({id : e.id})
            }
          })
        } else if (partyId) {
          
          let party = await client.party.findUnique({
            where: {
              id: partyId,
            },
            select: {
              payment: true,
            },
          });
          if (!party) {
            return {
              ok: false,
              msg: "Party not found.",
            };
          }

          let connectUsers = [];
          party.payment.forEach(element => {
            connectUsers.push({ id: element.userId })
          })

          room = await client.room.create({
            data: {
              users: {
                connect: connectUsers,
              },
              party: {
                connect: {id: partyId},
              },
            },
          });

          const users = await client.user.findMany({
            where: {
              rooms: {
                some: {
                  id: room.id,
                },
              },
            },
          })
  
          connectParticipants = await maekParticipant(connectUsers.length, users, room, loggedInUser.id, party)
        }
        
        if (photo) {
          payload = await uploadToS3(photo, loggedInUser.id, "uploads");
        }

        const message = await client.message.create({
          data: {
            type,
            payload,
            room: {
              connect: {
                id: room.id,
              },
            },
            user: {
              connect: {
                id: loggedInUser.id,
              },
            },
            unReaders: {
              connect: connectParticipants,
            },
          },
        });
        pubsub.publish(SEND_MESSAGE, { sendUpdates: message });
        return {
          ok: true,
        };
      }
    ),
  },
};

function shuffle(array) {
  for (let index = array.length - 1; index > 0; index--) {
    // 무작위 index 값을 만든다. (0 이상의 배열 길이 값) 
    const randomPosition = Math.floor(Math.random() * (index + 1)); // 임시로 원본 값을 저장하고, randomPosition을 사용해 배열 요소를 섞는다.
    const temporary = array[index];
    array[index] = array[randomPosition];
    array[randomPosition] = temporary;
  }
  return array
}

async function maekParticipant(people, users, room, loggedInUserId, party) {
  let groupCount = groupMaker(people);

  let gGroupNumList = []
  let mGroupNumList = []

  //6명일 때는 group 1
  if(people === 6){
    gGroupNumList.push(1, 1, 1)
    mGroupNumList.push(1, 1, 1)
  }
  else{
    for (let i = 1; i <= groupCount; i++) {
      gGroupNumList.push(i, i)
      mGroupNumList.push(i, i)
    }
  }
ㅌ
  const randomUser = shuffle(users)
  let exNum = 1

  let unReaderList = [];

  
  for (let element of randomUser) {
    
    let groupNum = 0
    //남녀 제한 인원 있는지에 따라
    if (party.male === null) {
      if(gGroupNumList.length > 0){
        groupNum = gGroupNumList.pop()
      }
      else if(mGroupNumList.length > 0){
        groupNum = gGroupNumList.pop()
      }
      else{
        groupNum = exNum
        exNum += 1
      }
    }
    else {
      if (element.sex == 'female') {
        if (gGroupNumList.length > 0) {
          groupNum = gGroupNumList.pop()
        }
        else {
          groupNum = exNum
          exNum += 1
        }
      }
      else if (element.sex == 'male') {
        if (mGroupNumList.length > 0) {
          groupNum = mGroupNumList.pop()
        }
        else {
          groupNum = exNum
          exNum += 1
        }
      }
    }

    let participant = await client.participant.create({
      data: {
        room: {
          connect:
          {
            id: room.id,
          },
        },
        user: {
          connect:
          {
            id: element.id,
          },
        },
        group: groupNum
      },
    });
    if (participant.userId != loggedInUserId) {
      unReaderList.push({ id: participant.id })
    }
  }              
  return unReaderList
}
      