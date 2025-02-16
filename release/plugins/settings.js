"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const src_1 = require("../src");
(0, src_1.Module)({
  name: 'settings',
  fromMe: true,
  desc: 'Get Configurations setup',
  type: 'settings'
}, async msg => {
  const config = await (0, src_1.getConfig)();
  const configs = ['prefix', 'mode', 'autoRead', 'autoStatusRead', 'autolikestatus', 'disablegc', 'disabledm', 'cmdReact', 'cmdRead'];
  const data = configs.map(key => `${key}: ${Array.isArray(config[key]) ? config[key].join(', ') : config[key]}`).join('\n');
  return await msg.reply(data);
});
(0, src_1.Module)({
  name: 'setprefix',
  fromMe: true,
  desc: 'Manage bot handler',
  type: 'settings'
}, async (msg, match) => {
  if (!match) return msg.reply('provide new prefix!');
  await (0, src_1.editConfig)({
    prefix: [match]
  });
  return await msg.reply('prefix updated!');
});
(0, src_1.Module)({
  name: 'ssave',
  fromMe: true,
  desc: 'Makes the bot save status',
  type: 'settings'
}, async (msg, match) => {
  if (!match) {
    return msg.reply('Use "on" or "off" to manage status autosave.');
  }
  if (match.includes('on')) {
    await (0, src_1.editConfig)({
      savebroadcast: true
    });
  } else if (match.includes('off')) {
    await (0, src_1.editConfig)({
      savebroadcast: false
    });
  }
  return await msg.reply(`Status autosave is now ${match}`);
});