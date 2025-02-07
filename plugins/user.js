import { bot } from '#src';
import {
  getAntiDelete,
  setAntiDelete,
  setAntiCall,
  getAntiCall,
  aliveMessage,
  setAliveMsg,
} from '#sql';

import { LANG } from '#extension';

bot(
  {
    pattern: 'alive',
    public: true,
    desc: 'Check if bot is alive',
    type: 'user',
  },
  async (message, match) => {
    if (match) {
      await setAliveMsg(match);
      return message.reply('Alive Updated');
    }
    const msg = await aliveMessage(message);
    const mentionData = {
      mentions: [message.sender],
      contextInfo: { mentionedJid: [message.sender] },
      externalAdReply: {
        title: LANG.BOT_NAME,
        body: 'ɪ ᴀᴍ ᴀʟɪᴠᴇ & ʀᴜɴɴɪɴɢ',
        mediaType: 1,
        thumbnailUrl: LANG.THUMBNAIL,
        sourceUrl: LANG.REPO_URL,
        showAdAttribution: true,
      },
    };

    return await message.send(msg, { ...mentionData });
  }
);

bot(
  {
    pattern: 'antidelete',
    public: false,
    desc: 'Setup Antidelete',
    type: 'user',
  },
  async (message, match) => {
    if (!['on', 'off'].includes(match)) return message.reply('Use on | off');
    const newState = match === 'on';
    if (getAntiDelete() === newState)
      return message.reply(`Antidelete is already ${match.toLowerCase()}.`);
    setAntiDelete(newState);
    message.reply(`Antidelete is now turned ${match.toLowerCase()}.`);
  }
);

bot(
  {
    pattern: 'anticall',
    public: false,
    desc: 'Simple AntiCall Setup',
    type: 'user',
  },
  async (message, match, { prefix }) => {
    if (!match) {
      const config = await getAntiCall();
      return message.reply(
        `AntiCall status: ${config.status},\nAction: ${config.action}\n${prefix}anticall [on/off/set]`
      );
    }

    const [command, param] = match.split(' ');

    switch (command) {
      case 'on':
        await setAntiCall('on');
        return message.reply('AntiCall enabled');

      case 'off':
        await setAntiCall('off');
        return message.reply('AntiCall disabled');

      case 'set':
        if (!['block', 'reject'].includes(param))
          return message.reply('Invalid action. Use "block" or "reject"');

        await setAntiCall(null, param);
        return message.reply(`AntiCall action set to ${param}`);

      default:
        return message.reply('Wrong Usage');
    }
  }
);
