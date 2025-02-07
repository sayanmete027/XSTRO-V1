import { bot } from '#src';
import { LANG } from '#extension';
import { addBgm, getBgmResponse, deleteBgm, getBgmList, saveMessages } from '#sql';

bot(
  {
    pattern: 'bgm',
    desc: 'Show BGM command menu',
    type: 'bgm',
  },
  async (message, _, { prefix }) => {
    const menuText = `
BGM Menu

Usage:
${prefix}bgm - Show menu
${prefix}addbgm <word> - Add BGM (reply to audio)
${prefix}getbgm <word> - Play BGM 
${prefix}delbgm <word> - Delete BGM
${prefix}listbgm - Show all BGMs

Note: Bot plays matching BGMs automatically in chat
`.trim();
    return message.reply(menuText);
  }
);

bot(
  {
    pattern: 'addbgm',
    public: false,
    desc: 'Add a new BGM entry',
    usage: '.addbgm word (reply to audio)',
    type: 'bgm',
  },
  async (message, match, { reply_message, loadMessage, quoted }) => {
    if (!match) return message.reply('Example: .addbgm hello (reply to audio)');
    if (!reply_message || !reply_message?.audio) return message.send(LANG.AUDIO);
    const word = match.trim().toLowerCase();
    const isadd = await addBgm(word, reply_message.key.id);
    if (!isadd) return message.send(`_BGM already exists for ${word}_`);
    if (!(await loadMessage(reply_message.key.id))) {
      await saveMessages(quoted);
    }
    return message.send(`_BGM added for ${word}_`);
  }
);

bot(
  {
    pattern: 'getbgm',
    desc: 'Get a BGM by word',
    usage: '.getbgm word',
    type: 'bgm',
  },
  async (msg, match, { prefix, loadMessage, relayMessage }) => {
    if (!match) return msg.reply(`Example: ${prefix}getbgm hello`);
    const msgId = await getBgmResponse(match.trim().toLowerCase());
    if (!msgId) return msg.reply(`No BGM found for ${match}`);
    const message = await loadMessage(msgId);
    if (!message) return msg.reply('Message not found');
    return await msg.forward(message.jid, message, { quoted: message });
  }
);

bot(
  {
    pattern: 'delbgm',
    public: false,
    desc: 'Delete a BGM entry',
    type: 'bgm',
  },
  async (msg, match, { prefix }) => {
    if (!match) return msg.reply(`Example: ${prefix}delbgm hello`);
    const word = match.trim().toLowerCase();
    const exists = await getBgmResponse(word);
    if (!exists) return msg.reply(`No BGM found for ${word}`);
    await deleteBgm(word);
    return msg.reply(`BGM deleted for ${word}`);
  }
);

bot(
  {
    pattern: 'listbgm',
    public: false,
    desc: 'List all available BGMs',
    type: 'bgm',
  },
  async (msg) => {
    const bgmList = await getBgmList();
    if (!bgmList.length) return msg.send('_No BGMs found_');
    const formattedList = bgmList.map((bgm) => `${bgm.word}`).join('\n');
    return msg.reply(`BGM List:\n\n${formattedList}`);
  }
);

bot(
  {
    on: 'text',
    dontAddCommandList: true,
  },
  async (msg, { loadMessage }) => {
    if (msg.sender === msg.user) return;
    const messageId = await getBgmResponse(msg.text.trim().toLowerCase());
    if (!messageId) return;
    const message = await loadMessage(messageId);
    if (!message) return;
    return await msg.forward(msg.jid, message, { quoted: message });
  }
);
