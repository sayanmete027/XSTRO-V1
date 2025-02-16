"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const src_1 = require("../src");
(0, src_1.Module)({
  name: 'vv',
  fromMe: false,
  desc: 'forward a viewonce message',
  type: 'whatsapp'
}, async msg => {
  if (!msg.quoted || !msg.quoted.viewonce) {
    return msg.reply('Reply viewonce');
  }
  msg.quoted.message[msg.quoted.type].viewOnce = false;
  await msg.forward(msg.owner, msg?.quoted, {
    quoted: msg.quoted
  });
  return msg.reply('done');
});
(0, src_1.Module)({
  name: 'waname',
  fromMe: true,
  desc: 'Updates your WA name',
  type: 'whatsapp'
}, async (msg, match) => {
  if (!match) return msg.reply('provide new name');
  await msg.client.updateProfileName(match);
  return msg.reply('done');
});