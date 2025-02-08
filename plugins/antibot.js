import { bot } from '#src';
import { delAntibot, getAntibot, setAntibot } from '#sql';

bot(
  {
    pattern: 'antibot',
    public: true,
    isGroup: true,
    type: 'group',
  },
  async (message, match, { jid }) => {
    if (!['on', 'off'].includes(match)) return message.send('Use: antibot on | off');
    const enabled = await getAntibot(jid);

    if (match === 'on') {
      if (enabled) return message.reply('Antibot is already enabled.');
      await setAntibot(jid, true);
      return message.reply('Antibot enabled for this group.');
    }

    if (!enabled) return message.reply('Antibot is already disabled.');
    await delAntibot(jid);
    return message.reply('Antibot disabled for this group.');
  }
);

bot(
  {
    on: 'anti-bot',
    dontAddCommandList: true,
  },
  async (message, { jid, groupParticipantsUpdate, sender, isAdmin, isBotAdmin, isGroup, sudo }) => {
    if (!isGroup || !(await getAntibot(jid)) || isAdmin || !isBotAdmin || sudo) return;

    if (message.bot) {
      await Promise.all([
        message.send(`@${sender.split('@')[0]} has been kicked for using a bot.`, {
          mentions: [sender],
        }),
        groupParticipantsUpdate(jid, [sender], 'remove'),
      ]);
    }
  }
);
