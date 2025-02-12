import { Module, getChatSummary, getGroupMembersMessageCount, getInactiveGroupMembers } from '#src';
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
    if (directChats.length === 0) {
      return message.reply('No direct chats found.');
    }
    const data = directChats.map((chat, index) => {
      return `PERSONAL CHATS: ${chat.name}\n
MSGS: ${chat.messageCount}
LAST MSG: ${new Date(chat.lastMessageTimestamp).toLocaleString()}`;
    });
    return await message.reply(data.join('\n\n'));
  }
);

Module(
  {
    name: 'listgc',
    fromMe: true,
    desc: 'Get group chats summary',
    type: 'user',
  },
  async (message, _, { groupMetadata }) => {
    const allChats = await getChatSummary();
    const groupChats = allChats.filter((chat) => isJidGroup(chat.jid));
    if (!groupChats) {
      return message.reply('No Groups found yet!');
    }
    const data = await Promise.all(
      groupChats.map(async (chat, index) => {
        const groupdata = await groupMetadata(chat.jid);
        return `GC: ${groupdata?.subject}\n
    MSGS: ${chat.messageCount}
    LAST MSG: ${new Date(chat.lastMessageTimestamp).toLocaleString()}`;
      })
    );
    return await message.reply(data.join('\n'));
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
    const groupData = await getGroupMembersMessageCount(message.jid);
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
  async (message, _, { jid }) => {
    const groupData = await getInactiveGroupMembers(jid, message.client);
    if (groupData.length === 0)
      return await message.reply('📊 Inactive Members: No inactive members found.');
    let inactiveMembers = '📊 Inactive Members:\n\n';
    inactiveMembers += `Total Inactive: ${groupData.length}\n\n`;
    groupData.forEach((jid, index) => {
      inactiveMembers += `${index + 1}. @${jid.split('@')[0]}\n`;
    });
    await message.send(inactiveMembers, { mentions: groupData });
  }
);
