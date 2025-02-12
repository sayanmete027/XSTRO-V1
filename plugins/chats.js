import {
  Module,
  getChatSummary,
  getGroupMembersMessageCount,
  getInactiveGroupMembers,
  groupMetadata,
} from '#src';
import { isJidGroup } from '#libary';

Module(
  {
    name: 'listpc',
    fromMe: true,
    desc: 'Get direct messages summary',
    type: 'user',
  },
  async (message) => {
    const allChats = await getChatSummary();
    const directChats = allChats.filter((chat) => chat.name);
    if (!directChats) return message.reply('No chats found!');
    return await message.reply(
      directChats.map(
        (data) =>
          `*From:* ${data.name}\n*Messages:* ${data.messageCount}\n*Last Chat:* ${new Date(data.lastMessageTimestamp).toLocaleString()}\n\n`
      )
    );
  }
);

Module(
  {
    name: 'listgc',
    fromMe: true,
    desc: 'Get group chats summary',
    type: 'user',
  },
  async (message) => {
    const allChats = await getChatSummary();
    const groupChats = allChats.filter((chat) => isJidGroup(chat.jid));
    if (!groupChats) return message.reply('No Groups found!');
    const data = await Promise.all(
      groupChats.map(async (data) => {
        const subject = (await groupMetadata(data.jid)).subject;
        return `*From:* ${subject}\n*Messages:* ${data.messageCount}\n*LastMessage:* ${new Date(data.lastMessageTimestamp).toLocaleString()}\n\n`;
      })
    );
    return await message.reply(data);
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
  async (message) => {
    const groupData = await getGroupMembersMessageCount(message.from);
    if (groupData.length === 0) return await message.send('No active members found.');
    let activeMembers = 'Active Group Members\n\n';
    groupData.forEach((member, index) => {
      activeMembers += `${index + 1}. ${member.name}\n`;
      activeMembers += `• Messages: ${member.messageCount}\n`;
    });

    await message.reply(activeMembers);
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
  async (message) => {
    const groupData = await getInactiveGroupMembers(message.from);
    if (groupData.length === 0) return await message.reply('No inactive members found.');
    let inactiveMembers = 'Inactive Members:\n\n';
    inactiveMembers += `Total Inactive: ${groupData.length}\n\n`;
    groupData.forEach((jid, index) => {
      inactiveMembers += `${index + 1}. @${jid.split('@')[0]}\n`;
    });
    await message.send(inactiveMembers, { mentions: groupData });
  }
);
