import { writeFile } from 'fs/promises';
import { downloadMediaMessage, getContentType } from '#libary';
import { FileTypeFromBuffer } from 'xstro-utils';

export function isMediaMessage(message) {
  const messageType = getContentType(message.message);
  return [
    'imageMessage',
    'documentMessage',
    'audioMessage',
    'videoMessage',
    'stickerMessage',
  ].includes(messageType);
}

export async function downloadMessage(message, asSaveFile = false) {
  if (!message || !isMediaMessage(message)) throw new Error('Message must be a media message');

  const media = await downloadMediaMessage(
    { key: message.key, message: message.message },
    'buffer',
    {},
    { logger: console }
  );

  if (asSaveFile) {
    const ext = await FileTypeFromBuffer(media);
    return await writeFile(`${message.key.id}.${ext}`, media);
  }

  return media;
}
