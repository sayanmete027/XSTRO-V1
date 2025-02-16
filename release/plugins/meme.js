"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const src_1 = require("../src");
(0, src_1.Module)({
  name: 'andrew',
  fromMe: false,
  desc: 'Fake Andrew Tate Tweet',
  type: 'memes'
}, async (message, match) => {
  if (!match) return message.send('Give me words');
  const res = await src_1.XSTRO.meme(match, 'andrew');
  if (!res) return await message.reply('Translation failed');
  return await message.send(res);
});
(0, src_1.Module)({
  name: 'elonmusk',
  fromMe: false,
  desc: 'Fake Elon Musk Tweet',
  type: 'memes'
}, async (message, match) => {
  if (!match) return message.send('Give me words');
  const res = await src_1.XSTRO.meme(match, 'elonmusk');
  if (!res) return await message.reply('Translation failed');
  return await message.send(res);
});
(0, src_1.Module)({
  name: 'messi',
  fromMe: false,
  desc: 'Fake Messi Tweet',
  type: 'memes'
}, async (message, match) => {
  if (!match) return message.send('Give me words');
  const res = await src_1.XSTRO.meme(match, 'messi');
  if (!res) return await message.reply('Translation failed');
  return await message.send(res);
});
(0, src_1.Module)({
  name: 'obama',
  fromMe: false,
  desc: 'Fake Obama Tweet',
  type: 'memes'
}, async (message, match) => {
  if (!match) return message.send('Give me words');
  const res = await src_1.XSTRO.meme(match, 'obama');
  if (!res) return await message.reply('Translation failed');
  return await message.send(res);
});
(0, src_1.Module)({
  name: 'ronaldo',
  fromMe: false,
  desc: 'Fake Ronaldo Tweet',
  type: 'memes'
}, async (message, match) => {
  if (!match) return message.send('Give me words');
  const res = await src_1.XSTRO.meme(match, 'ronaldo');
  if (!res) return await message.reply('Translation failed');
  return await message.send(res);
});
(0, src_1.Module)({
  name: 'trump',
  fromMe: false,
  desc: 'Fake Trump Tweet',
  type: 'memes'
}, async (message, match) => {
  if (!match) return message.send('Give me words');
  const res = await src_1.XSTRO.meme(match, 'trump');
  if (!res) return await message.reply('Translation failed');
  return await message.send(res);
});