import { getAntiDelete, loadMessage } from '#sql';
import { isMediaMessage, formatTime } from '#utils';

export async function AntiDelete(msg, instance) {
  if (
    !(await getAntiDelete()) ||
    msg.type !== 'protocolMessage' ||
    msg?.message?.protocolMessage?.type !== 'REVOKE'
  ) {
    return;
  }

  const messageId = msg?.message?.protocolMessage?.key.id;
  const store = await loadMessage(messageId);
  const sender = store.sender;
  const deleted = msg?.sender;
  const time = formatTime(Date.now());
  const message = store.message;
  const chat = msg.isGroup ? msg.key.remoteJid : msg.user;
  if (!isMediaMessage(store)) {
    const text = message.conversation || message.extendedTextMessage?.text;
    await instance.send(
      `ᴅᴇʟᴇᴛᴇᴅ ᴍsɢ\n\nᴀᴛ: ${time}\nsᴇɴᴛ ʙʏ: @${sender.split('@')[0]}\nᴅᴇʟᴇᴛᴇᴅ ʙʏ: @${deleted.split('@')[0]}\nʀᴇᴄᴏᴠᴇʀᴇᴅ ᴄᴏɴᴛᴇɴᴛ:\n${text}`,
      { jid: chat, mentions: [sender, deleted], quoted: store }
    );
  } else {
    await instance.forward(chat, store, { quoted: store });
  }
}
