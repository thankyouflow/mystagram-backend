import { protectedResolver } from "../../users/users.utils";
import client from "../../client";
import { processHashtags } from "../photos.utils";
import { uploadToS3 } from "../../shared/shared.utils";

export default {
  Mutation: {
    uploadPhoto: protectedResolver(
      async (_, { file, caption }, { loggedInUser }) => {
        let hashtagObj = []
        if (caption) {
          hashtagObj = processHashtags(caption)
        }
        const fileUrl = await uploadToS3(file, loggedInUser.id, "uploads");
        const photoUpload = client.photo.create({
          data: {
            file: fileUrl,
            caption,
            user: {
              connect: {
                id: loggedInUser.id,
              },
            },
            ...(hashtagObj.length > 0 && {
              hashtags: {
                connectOrCreate: hashtagObj,
              },
            }),
          },
        });
        if (photoUpload.id) {
          return {
            ok: true,
          };
        } else {
          return {
            ok: false,
            error: "Could not upload photo.",
          };
        }
      }
    ),
  },
};