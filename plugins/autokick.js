import { bot } from '#src';
import { addAKick, delKick, getKicks } from '#sql';

bot(
  {
    pattern: 'akick',
    public: false,
    isGroup: true,
    desc: 'Adds a member to auto-kick list.',
    type: 'autokick',
  },
  async (message, match, { jid }) => {
    if (!(await message.getAdmin())) return;
    const user = await message.msgId(match);

    const added = await addAKick(jid, user);
    return message.send(
      added
        ? `_User added to auto-kick list._ @${user.split('@')[0]}`
        : `_User is already on the list._ @${user.split('@')[0]}`,
      { mentions: [user] }
    );
  }
);

bot(
  {
    pattern: 'akickdel',
    public: false,
    isGroup: true,
    desc: 'Removes a member from the auto-kick list.',
    type: 'autokick',
  },
  async (message, match, { jid }) => {
    if (!(await message.getAdmin())) return;
    const user = await message.msgId(match);

    const deleted = await delKick(jid, user);
    return message.send(
      deleted
        ? `_User removed from auto-kick list._ @${user.split('@')[0]}`
        : `_User was not on the list._ @${user.split('@')[0]}`,
      { mentions: [user] }
    );
  }
);

bot(
  {
    pattern: 'getakick',
    public: false,
    isGroup: true,
    desc: 'Shows all members in the auto-kick list.',
    type: 'autokick',
  },
  async (message, _, { jid }) => {
    if (!(await message.getAdmin())) return;
    const kicks = await getKicks(jid);

    if (kicks.length > 0) {
      return message.send(
        `_Users in auto-kick list:_\n${kicks.map((k) => `• @${k.userJid.split('@')[0]}`).join('\n')}`,
        { mentions: [kicks] }
      );
    }
    return message.send('_No users found in the auto-kick list._');
  }
);
