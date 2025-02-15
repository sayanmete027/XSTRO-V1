import {
  Module,
  getChatSummary,
  getGroupMembersMessageCount,
  getInactiveGroupMembers,
  groupMetadata,
} from '../src';
import { isJidGroup } from '../resources';
import { Message } from '../types';

Module(
  {
    name: 'listpc',
    fromMe: true,
    desc: 'Get direct messages summary',
    type: 'user',
  },
  async (msg: Message) => {
    const allChats = await getChatSummary();
    const directChats = allChats.filter((chat) => chat.name);
    if (!directChats) return msg.reply('No chats found!');
    const data = directChats
      .map(
        (data) =>
          `*From:* ${data.name}\n*Messages:* ${data.messageCount}\n*Last Chat:* ${new Date(data.lastMessageTimestamp).toLocaleString()}\n`
      )
      .join('');
    return await msg.reply(data)
  }
);

Module(
  {
    name: 'listgc',
    fromMe: true,
    desc: 'Get group chats summary',
    type: 'user',
  },
  async (msg:Message) => {
    const allChats = await getChatSummary();
    const groupChats = allChats.filter((chat) => isJidGroup(chat.jid));
    if (!groupChats) return msg.reply('No Groups found!');
    const data = (await Promise.all(
      groupChats.map(async (data) => {
        const subject = (await groupMetadata(data.jid))?.subject!;
        return `*From:* ${subject}\n*Messages:* ${data.messageCount}\n*LastMessage:* ${new Date(data.lastMessageTimestamp).toLocaleString()}\n`;
      })
    )).join('');
    return await msg.reply(data);
  }
);

Module(
  {
    name: 'active',
    fromMe: true,
    isGroup: true,
    desc: 'Return the Active Group Members from when the Module started running',
    type: 'group',
  },
  async (msg:Message) => {
    const groupData = await getGroupMembersMessageCount(msg.jid);
    if (groupData.length === 0) return await msg.send('No active members found.');
    let activeMembers = 'Active Group Members\n\n';
    groupData.forEach((member, index) => {
      activeMembers += `${index + 1}. ${member.name}\n`;
      activeMembers += `• Messages: ${member.messageCount}\n`;
    });

    await msg.reply(activeMembers);
  }
);

Module(
  {
    name: 'inactive',
    fromMe: true,
    isGroup: true,
    desc: 'Get the inactive group members from a group',
    type: 'group',
  },
  async (msg:Message) => {
    const groupData = await getInactiveGroupMembers(msg.jid);
    if (groupData.length === 0) return await msg.reply('No inactive members found.');
    let inactiveMembers = 'Inactive Members:\n\n';
    inactiveMembers += `Total Inactive: ${groupData.length}\n\n`;
    groupData.forEach((jid, index) => {
      inactiveMembers += `${index + 1}. @${jid.split('@')[0]}\n`;
    });
    await msg.send(inactiveMembers, { mentions: groupData });
  }
);