import { isJidBroadcast } from 'baileys';
import { getConfig } from '../../src/index';
import { Message } from '../../types';

/**
 * Purpose of this to Automatically save status
 */
export async function autoSaveBroadCast(message:Message) {
  /** Fetch AutoSaveBroadCast from Our DB */
  const { savebroadcast } = await getConfig();
  /** If the there's no status or the status is from myself, we ignore it */
  if (!savebroadcast || !isJidBroadcast(message.jid) || message.key?.participant === message.owner) {
    return;
  }

  /** Easy Method, we just forward the broadcast status to our dm, this takes less than a second, it's fast and reliable */
  return await message.forward(message.owner, message, { quoted: message });
}