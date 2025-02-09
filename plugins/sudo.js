import { bot } from '#src';
import { getSudo, delSudo, addSudo, isSudo } from '#sql';

bot(
  {
    pattern: 'sudo',
    public: false,
    desc: 'How to use Sudo commands',
    type: 'sudo',
  },
  async (message, _, { prefix }) => {
    return message.reply(`How to Use Sudo\n
${prefix}setsudo @user
${prefix}getsudo
${prefix}delsudo @user
`);
  }
);

bot(
  {
    pattern: 'setsudo',
    public: false,
    desc: 'SetSudo A Specific User',
    type: 'sudo',
  },
  async (message, match) => {
    const jid = await message.msgId(match);
    if (!jid) return;
    if (await isSudo(jid)) return message.reply('Already a Sudo');
    await addSudo(jid);
    return message.send('@' + jid.split('@')[0] + ' is now a Sudo', { mentions: [jid] });
  }
);

bot(
  {
    pattern: 'delsudo',
    public: false,
    desc: 'Remove a Sudo User',
    type: 'sudo',
  },
  async (message, match) => {
    const jid = await message.msgId(match);
    if (!jid) return;
    if (!(await isSudo(jid))) return message.reply(`Wasn't a Sudo user`);
    await delSudo(jid);
    return await message.send(`@${jid.split('@')[0]} removed from sudo users`, { mentions: [jid] });
  }
);

bot(
  {
    pattern: 'getsudo',
    public: false,
    desc: 'Get List of Sudo Users',
    type: 'sudo',
  },
  async (message) => {
    const users = getSudo();
    if (!users || users.length === 0) return message.send('ɴᴏ sᴜᴅᴏ ғᴏᴜɴᴅ');
    const list = users.map((jid) => `@${jid.split('@')[0]}`).join('\n');
    return message.send(`*Sudo Users:*\n\n${list}`, { mentions: users });
  }
);
