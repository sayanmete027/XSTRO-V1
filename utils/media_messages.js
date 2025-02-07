import { writeFile } from 'fs/promises';
import { downloadMediaMessage, getContentType } from '#libary';
import { FileTypeFromBuffer } from 'xstro-utils';

export function isMediaMessage(message) {
  const messageType = getContentType(message.message);
  return ['imageMessage', 'documentMessage', 'audioMessage', 'videoMessage', 'stickerMessage'].includes(messageType);
}

export function editMessageProptery(message, propertyPath, value) {
  if (!message || typeof message !== 'object') throw new Error('Message must be an object');
  if (typeof propertyPath !== 'string') throw new Error('Property path must be a string using dot notation');

  const result = JSON.parse(JSON.stringify(message));
  const keys = propertyPath.split('.');
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (key === '__proto__' || key === 'constructor') throw new Error('Prototype pollution attempt detected');
    if (!(key in current)) throw new Error(`"${propertyPath}" does not exist in message`);
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result;
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
