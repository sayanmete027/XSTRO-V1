import { bot } from '#src';
import { extractUrl } from '#utils';
import { delay } from '#libary';

bot(
  {
    pattern: 'readmore',
    public: true,
    desc: 'Adds *readmore* in given text.',
    type: 'misc',
  },
  async (message, match) => {
    if (!match) return await message.send('*Give me text!*');
    const result = readmore(match);
    const readmore = (text) => {
      const [text1, text2] = text.split('|');
      if (!text2) return null;
      return text1 + String.fromCharCode(8206).repeat(4001) + `\n${text2}`;
    };
    if (!result) return await message.send('*Format: text1|text2*');
    return await message.send(result);
  }
);

bot(
  {
    pattern: 'mp4url',
    public: true,
    desc: 'Get direct mp4 url from video message',
    type: 'misc',
  },
  async (message, match, { jid, sendMessage }) => {
    if (!match || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(match))
      return message.send('*Provide URL*');
    const url = extractUrl(match);
    return await sendMessage(jid, { video: { url: url } });
  }
);

bot(
  {
    pattern: 'mp3url',
    public: true,
    desc: 'Get direct mp3 URL from an audio message',
    type: 'misc',
  },
  async (message, match, { jid, sendMessage }) => {
    if (!match || !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(match))
      return message.send('*Provide URL*');
    const url = extractUrl(match);
    return await sendMessage(jid, { audio: { url: url }, mimetype: 'audio/mpeg' });
  }
);

bot(
  {
    pattern: 'getbio',
    public: true,
    type: 'misc',
    desc: 'Get the WhatsApp Bio of a User',
  },
  async (message, match, { fetchStatus }) => {
    const jid = await message.getJid(match);
    if (!jid) return;
    console.log(jid);
    const { status, setAt } = await fetchStatus(jid);
    if (status && setAt) {
      await message.send(`*Bio:* ${status}\n*SetAt:* ${setAt}`);
    } else {
      message.send(`*No Bio Found!*`);
    }
  }
);

bot(
  {
    pattern: 'advertise',
    public: false,
    desc: 'Advertise a message to all groups',
    type: 'misc',
  },
  async (message, match, { groupFetchAllParticipating }) => {
    if (!match) return message.send('Provide a message to advertise');
    const data = await groupFetchAllParticipating();
    const groups = Object.values(data).map((group) => group.id);
    await message.send(`Advertising to ${groups.length} groups.`);
    for (const group of groups) {
      await delay(1500);
      await message.send(match, {
        jid: group,
        contextInfo: { forwardingScore: 999, isForwarded: true },
      });
    }
    return message.send(`Shared to ${groups.length} groups.`);
  }
);
