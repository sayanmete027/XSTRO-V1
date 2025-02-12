import {
  bot,
  audioToBlackVideo,
  convertToMp3,
  convertWebPFile,
  createSticker,
  cropToCircle,
  flipMedia,
  isAnimatedWebp,
  resizeImage,
  toPTT,
  toVideo,
  webpToImage,
  XSTRO,
  LANG,
} from '#src';

bot(
  {
    pattern: 'sticker',
    public: true,
    desc: 'Converts Images and Videos to Sticker',
    type: 'converter',
  },
  async (message, match, { reply_message }) => {
    match = match.split(',');
    let media;
    if (!reply_message || (!reply_message.image && !reply_message.video)) {
      return message.reply('Reply Image or Video');
    }
    media = await message.download();
    media = await createSticker(media, match[0], match[1]);
    return message.send(media, { type: 'sticker' });
  }
);

bot(
  {
    pattern: 'take',
    public: true,
    desc: 'rebrands a sticker to bot',
    type: 'converter',
  },
  async (message, match) => {
    match = match.split(',');
    let media;
    if (!message.reply_message.sticker) return message.reply(LANG.STICKER);
    media = await message.download();
    if (await isAnimatedWebp(media)) {
      media = await convertWebPFile(media);
      media = await createSticker(media, match[0], match[1]);
      return message.send(media, { type: 'sticker' });
    } else {
      media = await createSticker(media, match[0], match[1]);
      return message.send(media, { type: 'sticker' });
    }
  }
);

bot(
  {
    pattern: 'flip',
    public: true,
    desc: 'Flip media left/right/vertical/horizontal',
    type: 'converter',
  },
  async (message, match, { prefix, reply_message }) => {
    let media;
    if (!reply_message || (!reply_message?.image && !reply_message?.video))
      return message.reply('Reply Image or Video');
    if (!['left', 'right', 'vertical', 'horizontal'].includes(match)) {
      return message.send(`Usage: ${prefix}flip <${validDirections.join('/')}>`);
    }
    media = await message.download();
    media = await flipMedia(media, match);
    return message.send(media, { caption: `Flipped to ${match}` });
  }
);

bot(
  {
    pattern: 'black',
    public: true,
    desc: 'Converts Audio to Black Video',
    type: 'converter',
  },
  async (message, _, { reply_message }) => {
    let media;
    if (!reply_message || !reply_message.audio) return message.send(LANG.AUDIO);
    media = await message.download();
    media = await audioToBlackVideo(media);
    return await message.send(media);
  }
);

bot(
  {
    pattern: 'ttp',
    public: true,
    desc: 'Designs ttp Stickers',
    type: 'converter',
  },
  async (message, match, { prefix }) => {
    if (!match) return message.send(`Usage: ${prefix}ttp Astro`);
    const buff = await XSTRO.ttp(match);
    const sticker = await createSticker(buff);
    return await message.send(sticker, { type: 'sticker' });
  }
);

bot(
  {
    pattern: 'photo',
    public: true,
    desc: 'Convert Sticker to Photo',
    type: 'converter',
  },
  async (message, _, { reply_message }) => {
    let media;
    if (!reply_message || !reply_message.sticker) return message.send(LANG.STICKER);
    media = await message.download();
    media = await webpToImage(media);
    return message.send(media);
  }
);

bot(
  {
    pattern: 'mp3',
    public: true,
    desc: 'Convert Video to Audio',
    type: 'converter',
  },
  async (message, _, { reply_message }) => {
    let media;
    if (!reply_message || (!reply_message?.video && !reply_message?.audio))
      return message.reply('Reply Video or Audio');
    media = await message.download();
    media = await convertToMp3(media);
    return await message.send(media, {
      mimetype: 'audio/mpeg',
      ptt: false,
    });
  }
);

bot(
  {
    pattern: 'ptt',
    public: true,
    desc: 'Convert Video to WhatsApp Opus',
    type: 'converter',
  },
  async (message, { jid, reply_message, sendMessage }) => {
    let media;
    if (!reply_message || (!reply_message.video && !reply_message.audio))
      return message.send('Reply Video or Audio');
    media = await message.download();
    media = await toPTT(media);
    return await sendMessage(jid, {
      audio: media,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
    });
  }
);

bot(
  {
    pattern: 'mp4',
    public: true,
    desc: 'Converts Video to playable WhatsApp Video',
    type: 'converter',
  },
  async (message) => {
    let media;
    if (!message.reply_message.video && !message.reply_message.sticker)
      return message.send('Reply Video');
    media = await message.download();
    media = await toVideo(media);
    return await message.client.sendMessage(message.jid, {
      video: media,
      mimetype: 'video/mp4',
    });
  }
);

bot(
  {
    pattern: 'crop',
    public: true,
    desc: 'Converts Image or Sticker to Cropped Sticker',
    type: 'converter',
  },
  async (message, _, { reply_message }) => {
    let media;
    if (!reply_message || (!reply_message.image && !reply_message.sticker))
      return message.reply('Reply Image or Sticker');
    media = await message.download();
    media = await cropToCircle(media);
    return await message.send(media, { type: 'sticker' });
  }
);

bot(
  {
    pattern: 'resize',
    public: true,
    desc: 'Resizes an Image',
    type: 'converter',
  },
  async (message, match, { prefix, reply_message }) => {
    let media;
    if (!reply_message || !reply_message.image) return message.reply(LANG.IMAGE);
    if (!match)
      return message.reply(
        'Give me dimensions to resize the Image to, ' + prefix + 'resize 800x600'
      );
    match = match.split('x');
    media = await message.download();
    const newImage = await resizeImage(media, Number(match[0]), Number(match[1]));
    return await message.sendFile(newImage, 'resized');
  }
);
