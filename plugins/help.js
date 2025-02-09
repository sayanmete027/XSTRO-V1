import { bot } from '#src';
import { devs, toJid } from '#utils';
import { LANG } from '#extension';

bot(
  {
    pattern: 'report',
    public: true,
    desc: 'Request Feature or Report Bugs',
    type: 'help',
  },
  async (message, match) => {
    if (!match || match.split(' ').length <= 3)
      return message.send('Provide at least 3 words to report a bug.');
    const helpers = await devs();
    const errorReport = `BUG REPORT\nFROM: @${message.sender.split('@')[0]}\nMESSAGE: \n${match}`;
    for (const dev of helpers)
      await message.send(errorReport, { jid: toJid(dev), mentions: [message.sender] });
  }
);

bot(
  {
    pattern: 'repo',
    public: true,
    desc: 'Github Repository Link',
    type: 'help',
  },
  async (message) => {
    return await message.reply(LANG.ABOUT);
  }
);

bot(
  {
    pattern: 'pair',
    public: true,
    desc: 'Get Your Pairing Code Now',
    type: 'help',
  },
  async (message, match) => {
    const jid = await message.msgId(match);
    if (!jid) return;
    if (!jid) return message.send('Provide A Number To Pair');
    const msg = await message.send('Getting Pairing Code');
    const { code } = await (
      await fetch(`https://xstrosession.koyeb.app/pair?phone=${jid.split('@')[0]}`)
    ).json();
    await msg.edit(code ? code : '*unable to get a pairing code, try again!*');
  }
);

bot(
  {
    pattern: 'support',
    public: true,
    desc: 'Support Team',
    type: 'help',
  },
  async (message, _, { jid, sendMessage }) => {
    const contacts = (await devs()).map((dev) => {
      return {
        vcard: `BEGIN:VCARD
VERSION:3.0
FN:xsᴛʀᴏ sᴜᴘᴘᴏʀᴛ ${dev}
ORG:${LANG.BOT_NAME}
TEL;type=CELL;type=VOICE;waid=${dev}:${dev}
END:VCARD`,
      };
    });
    return await sendMessage(jid, {
      contacts: {
        displayName: 'ᴅᴇᴠ sᴜᴘᴘᴏʀᴛ',
        contacts: contacts,
      },
    });
  }
);
