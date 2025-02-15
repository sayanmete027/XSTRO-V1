import { Module } from '#src';

Module(
  {
    name: 'vv',
    fromMe: false,
    desc: 'forward a viewonce message',
    type: 'whatsapp',
  },
  async (msg, match, { quoted }) => {
    if (!quoted || !quoted.viewonce) {
      return msg.reply('Reply viewonce');
    }
    quoted.message[quoted.type].viewOnce = false;
    await msg.forward(msg.owner, quoted, { quoted: quoted });
    return msg.reply('done');
  }
);

Module(
  {
    name: 'waname',
    fromMe: true,
    desc: 'Updates your WA name',
    type: 'whatsapp',
  },
  async (msg, match, { updateProfileName }) => {
    if (!match) return msg.reply('provide new name');
    await updateProfileName(match);
    return msg.reply('done');
  }
);
