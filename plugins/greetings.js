import { bot } from '#src';
import { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } from '#sql';

bot(
  {
    pattern: 'welcome',
    public: false,
    isGroup: true,
    desc: 'SetUp Welcome Messages For Group',
    type: 'group',
  },
  async (message, match, { jid, prefix }) => {
    if (!match)
      return message.reply(`Welcome is ${(await isWelcomeOn(jid)) ? 'Enabled' : 'Disabled'}`);
    if (match === 'on') {
      if (await isWelcomeOn(jid)) return message.send('Welcome Already Enabled');
      await addWelcome(jid, true, null);
      return message.send(`Welcome enabled, use ${prefix}welcome to customize`);
    }
    if (match === 'off') {
      if (!(await isWelcomeOn(jid))) return message.send('Welcome Already Disabled');
      await delWelcome(jid);
      return message.reply('Welcome Disabled');
    }
    await addWelcome(jid, true, match);
    return message.reply('Welcome Message Updated');
  }
);

bot(
  {
    pattern: 'goodbye',
    public: false,
    isGroup: true,
    desc: 'SetUp Goodbye Messages For Group',
    type: 'group',
  },
  async (message, match, { jid, prefix }) => {
    if (!match)
      return message.reply(`Goodbye is ${(await isGoodByeOn(jid)) ? 'Enabled' : 'Disabled'}`);
    if (match === 'on') {
      if (await isGoodByeOn(jid)) return message.reply('Goodbye Already Enabled');
      await addGoodbye(jid, true, null);
      return message.reply(`Goodbye enabled, use ${prefix}goodbye to customize`);
    }
    if (match === 'off') {
      if (!(await isGoodByeOn(jid))) return message.reply('Goodbye Already Disabled');
      await delGoodBye(jid);
      return message.reply('Goodbye Disabled');
    }
    await addGoodbye(jid, true, match);
    return message.reply('Goodbye Message Updated');
  }
);
