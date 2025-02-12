import { Module, XSTRO } from '#src';

Module(
  {
    name: 'andrew',
    fromMe: false,
    desc: 'Fake Andrew Tate Tweet',
    type: 'memes',
  },
  async (message, match) => {
    if (!match) return message.send('Give me words');
    const res = await XSTRO.meme(match, 'andrew');
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
  async (message, match) => {
    if (!match) return message.send('Give me words');
    const res = await XSTRO.meme(match, 'elonmusk');
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
  async (message, match) => {
    if (!match) return message.send('Give me words');
    const res = await XSTRO.meme(match, 'messi');
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
  async (message, match) => {
    if (!match) return message.send('Give me words');
    const res = await XSTRO.meme(match, 'obama');
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
  async (message, match) => {
    if (!match) return message.send('Give me words');
    const res = await XSTRO.meme(match, 'ronaldo');
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
  async (message, match) => {
    if (!match) return message.send('Give me words');
    const res = await XSTRO.meme(match, 'trump');
    return await message.send(res);
  }
);
