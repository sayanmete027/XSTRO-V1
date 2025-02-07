import { isJidGroup } from '#libary';
import { getAntiWords, isAntiWordEnabled } from '#sql';

export async function AntiWord(msg) {
  if (!isJidGroup(msg.from)) return;
  if (!msg.body || !msg.sender) return;
  if (msg.sender === msg.user || msg.sudo || msg.isAdmin) return;
  if (await isAntiWordEnabled(msg.from)) {
    const badwords = await getAntiWords(msg.from);
    if (!badwords) return;

    const un_allowed_words = badwords.words;
    if (un_allowed_words.some((word) => msg.body.toLowerCase().includes(word.toLowerCase()))) {
      if (!msg.isBotAdmin) return;
      await msg.client.sendMessage(msg.from, { delete: msg?.key });
      await msg.send(
        `@${msg.sender.split('@')[0]} your message has been deleted for using a prohibited word.`,
        {
          mentions: [msg.sender],
        }
      );
    }
  }
}
