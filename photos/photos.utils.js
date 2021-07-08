export const processHashtags = (caption) => {
    const hashtags = caption.match(/#[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]+/g) || [];
    return hashtags.map((hashtag) => ({
      where: { hashtag },
      create: { hashtag },
    }));
  };