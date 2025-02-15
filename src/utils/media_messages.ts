import { writeFile } from 'fs/promises';
import { downloadMediaMessage, getContentType, WAProto } from '../../resources';
import { FileTypeFromBuffer } from '../../src';
import { Message } from '../../types';

type MediaMessageType = 'imageMessage' | 'documentMessage' | 'audioMessage' | 'videoMessage' | 'stickerMessage';

export function isMediaMessage(message: Message): boolean {
  const msg = WAProto.WebMessageInfo.fromObject(message)
  const messageType = getContentType(msg.message!) as MediaMessageType;
  return [
    'imageMessage',
    'documentMessage',
    'audioMessage',
    'videoMessage',
    'stickerMessage',
  ].includes(messageType);
}

export async function downloadMessage(message: Message, asSaveFile: boolean = false): Promise<Buffer | void> {
  if (!message || !isMediaMessage(message)) throw new Error('Message must be a media message');
  const msg = WAProto.WebMessageInfo.fromObject(message)

  const media: Buffer = await downloadMediaMessage(
    msg,
    'buffer',
    {}
  );

  if (asSaveFile) {
    const ext = await FileTypeFromBuffer(media);
    return await writeFile(`${message.key.id}.${ext}`, media);
  }

  return media;
}
