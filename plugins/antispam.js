import { bot } from '#src';
import { setAntiSpam, getAntiSpamMode } from '#sql';

bot(
  {
    pattern: 'antispam',
    public: false,
    desc: 'Simple Antispam Setup',
    type: 'user',
  },
  async (msg, match, { jid, prefix, isGroup }) => {
    if (!match)
      return msg.reply(
        `Usage:\n${prefix}antispam on\n${isGroup ? `${prefix}antispam set [kick|delete]\n` : ''}${prefix}antispam off`
      );

    const [cmd, opt] = match.toLowerCase().split(' ');
    const mode = await getAntiSpamMode(jid);

    if (cmd === 'on') {
      if (mode !== 'off')
        return msg.reply(
          isGroup
            ? 'Antispam is already enabled for this group.'
            : 'Antispam is already enabled for dm.'
        );
      await setAntiSpam(jid, isGroup ? 'off' : 'block');
      return msg.reply(
        isGroup ? 'Antispam enabled. Use `antispam set` to configure.' : 'Dm antispam enabled.'
      );
    }

    if (cmd === 'set') {
      if (!isGroup) return msg.reply('For Groups Only!');
      if (!['kick', 'delete'].includes(opt))
        return msg.reply(`Use ${prefix}antispam set kick or ${prefix}antispam set delete.`);
      await setAntiSpam(jid, opt);
      return msg.reply(`Antispam set to: ${opt}`);
    }

    if (cmd === 'off') {
      if (mode === 'off')
        return msg.reply(
          isGroup
            ? 'Antispam is already disabled for this group.'
            : 'Dm antispam is already disabled.'
        );
      await setAntiSpam(jid, 'off');
      return msg.send(isGroup ? '_Antispam disabled for this group._' : '_Dm antispam disabled._');
    }

    msg.send(
      `Usage:\n${prefix}antispam on\n${isGroup ? `${prefix}antispam set [kick|delete]\n` : ''}${prefix}antispam off`
    );
  }
);
