import { bot } from '#src';
import { getChatSummary, getGroupMembersMessageCount, getInactiveGroupMembers } from '#sql';
import { toJid } from '#utils';

bot(
  {
    pattern: 'listpc',
    public: false,
    desc: 'Get direct messages summary',
    type: 'user',
  },
  async (message) => {
    const allChats = await getChatSummary();
    const dmChats = allChats.filter(
      (chat) =>
        !chat.jid.endsWith('@g.us') &&
        !chat.jid.endsWith('@newsletter') &&
        chat.jid !== 'status@broadcast' &&
        chat.jid !== message.user
    );

    if (dmChats.length === 0) {
      return message.reply('No messages avaliable.');
    }

    const Jids = dmChats.map((chat) => chat.jid);
    const pmMsg = dmChats.map(
      (chat, index) =>
        `${index + 1}. @${toJid(chat.jid).split('@')[0]}
*Messages:* ${chat.messageCount}
*Time:* ${new Date(chat.lastMessageTimestamp).toLocaleString()}`
    );

    message.send(`*Personal Messages:*\n\n${pmMsg.join('\n\n')}`, { mentions: Jids });
  }
);

bot(
  {
    pattern: 'listgc',
    public: false,
    desc: 'Get group chats summary',
    type: 'user',
  },
  async (message) => {
    const allChats = await getChatSummary();
    const groupChats = allChats.filter((chat) => chat.jid.endsWith('@g.us'));

    if (groupChats.length === 0) {
      return message.send('No group chats found.');
    }

    const data = await Promise.all(
      groupChats.map(async (chat, index) => {
        try {
          const groupMetadata = await message.client.groupMetadata(chat.jid);
          return `GC: ${groupMetadata?.subject || 'Unknown Group'}
MSGS: ${chat.messageCount}
LAST MSG: ${new Date(chat.lastMessageTimestamp).toLocaleString()}`;
        } catch (error) {
          return `GROUP: Unknown Group
Messages: ${chat.messageCount}
Last Message: ${new Date(chat.lastMessageTimestamp).toLocaleString()}`;
        }
      })
    );

    message.reply(`Group Chats:\n\n${data.join('\n\n')}`);
  }
);

bot(
  {
    pattern: 'active',
    public: true,
    isGroup: true,
    desc: 'Return the Active Group Members from when the bot started running',
    type: 'group',
  },
  async (message) => {
    const groupData = await getGroupMembersMessageCount(message.jid);
    if (groupData.length === 0) return await message.send('_No active members found._');
    let activeMembers = 'Active Group Members\n\n';
    groupData.forEach((member, index) => {
      activeMembers += `${index + 1}. ${member.name}\n`;
      activeMembers += `• Messages: ${member.messageCount}\n`;
    });

    await message.reply(activeMembers);
  }
);

bot(
  {
    pattern: 'inactive',
    public: true,
    isGroup: true,
    desc: 'Get the inactive group members from a group',
    type: 'group',
  },
  async (message) => {
    const groupData = await getInactiveGroupMembers(message.jid, message.client);
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
