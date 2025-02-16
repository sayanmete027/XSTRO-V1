"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const src_1 = require("../src");
const baileys_1 = require("baileys");
(0, src_1.Module)({
  name: 'listpc',
  fromMe: true,
  desc: 'Get direct messages summary',
  type: 'user'
}, async msg => {
  const allChats = await (0, src_1.getChatSummary)();
  const directChats = allChats.filter(chat => chat.name);
  if (!directChats) return msg.reply('No chats found!');
  const data = directChats.map(data => `*From:* ${data.name}\n*Messages:* ${data.messageCount}\n*Last Chat:* ${new Date(data.lastMessageTimestamp).toLocaleString()}\n`).join('');
  return await msg.reply(data);
});
(0, src_1.Module)({
  name: 'listgc',
  fromMe: true,
  desc: 'Get group chats summary',
  type: 'user'
}, async msg => {
  const allChats = await (0, src_1.getChatSummary)();
  const groupChats = allChats.filter(chat => (0, baileys_1.isJidGroup)(chat.jid));
  if (!groupChats) return msg.reply('No Groups found!');
  const data = (await Promise.all(groupChats.map(async data => {
    const subject = (await (0, src_1.groupMetadata)(data.jid))?.subject;
    return `*From:* ${subject}\n*Messages:* ${data.messageCount}\n*LastMessage:* ${new Date(data.lastMessageTimestamp).toLocaleString()}\n`;
  }))).join('');
  return await msg.reply(data);
});
(0, src_1.Module)({
  name: 'active',
  fromMe: true,
  isGroup: true,
  desc: 'Return the Active Group Members from when the Module started running',
  type: 'group'
}, async msg => {
  const groupData = await (0, src_1.getGroupMembersMessageCount)(msg.jid);
  if (groupData.length === 0) return await msg.send('No active members found.');
  let activeMembers = 'Active Group Members\n\n';
  groupData.forEach((member, index) => {
    activeMembers += `${index + 1}. ${member.name}\n`;
    activeMembers += `• Messages: ${member.messageCount}\n`;
  });
  await msg.reply(activeMembers);
});
(0, src_1.Module)({
  name: 'inactive',
  fromMe: true,
  isGroup: true,
  desc: 'Get the inactive group members from a group',
  type: 'group'
}, async msg => {
  const groupData = await (0, src_1.getInactiveGroupMembers)(msg.jid);
  if (groupData.length === 0) return await msg.reply('No inactive members found.');
  let inactiveMembers = 'Inactive Members:\n\n';
  inactiveMembers += `Total Inactive: ${groupData.length}\n\n`;
  groupData.forEach((jid, index) => {
    inactiveMembers += `${index + 1}. @${jid.split('@')[0]}\n`;
  });
  await msg.send(inactiveMembers, {
    mentions: groupData
  });
});