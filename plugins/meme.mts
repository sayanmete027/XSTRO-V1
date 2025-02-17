import { Module, XSTRO,Message } from '../src/index.mjs';

Module(
  {
    name: 'andrew',
    fromMe: false,
    desc: 'Fake Andrew Tate Tweet',
    type: 'memes',
  },
  async (message:Message, match:string) => {
    if (!match) return message.send('Give me words');
    const res = await XSTRO.meme(match, 'andrew');
    if (!res) return await message.reply('Translation failed');
    return await message.send(res);
  }
);

Module(
  {
    name: 'elonmusk',
    fromMe: false,
    desc: 'Fake Elon Musk Tweet',
    type: 'memes',
  },
  async (message:Message, match:string) => {
    if (!match) return message.send('Give me words');
    const res = await XSTRO.meme(match, 'elonmusk');
    if (!res) return await message.reply('Translation failed');
    return await message.send(res);
  }
);

Module(
  {
    name: 'messi',
    fromMe: false,
    desc: 'Fake Messi Tweet',
    type: 'memes',
  },
  async (message:Message, match:string) => {
    if (!match) return message.send('Give me words');
    const res = await XSTRO.meme(match, 'messi');
    if (!res) return await message.reply('Translation failed');
    return await message.send(res);
  }
);

Module(
  {
    name: 'obama',
    fromMe: false,
    desc: 'Fake Obama Tweet',
    type: 'memes',
  },
  async (message:Message, match:string) => {
    if (!match) return message.send('Give me words');
    const res = await XSTRO.meme(match, 'obama');
    if (!res) return await message.reply('Translation failed');
    return await message.send(res);
  }
);

Module(
  {
    name: 'ronaldo',
    fromMe: false,
    desc: 'Fake Ronaldo Tweet',
    type: 'memes',
  },
  async (message:Message, match:string) => {
    if (!match) return message.send('Give me words');
    const res = await XSTRO.meme(match, 'ronaldo');
    if (!res) return await message.reply('Translation failed');
    return await message.send(res);
  }
);

Module(
  {
    name: 'trump',
    fromMe: false,
    desc: 'Fake Trump Tweet',
    type: 'memes',
  },
  async (message:Message, match:string) => {
    if (!match) return message.send('Give me words');
    const res = await XSTRO.meme(match, 'trump');
    if (!res) return await message.reply('Translation failed');
    return await message.send(res);
  }
);
