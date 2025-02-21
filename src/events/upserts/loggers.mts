import { getName, groupMetadata, logger, Message } from "../../index.mjs";

export async function LoggerMsg(message: Message) {
  const textMsg = message.text;
  if (message.isGroup) {
    if (!message.jid || !message.sender) return;
    const metadata = await groupMetadata(message.jid);
    if (!metadata?.subject) return;
    const sender = await getName(message.sender);
    if (!sender) return;
    const content = textMsg || message.type;
    if (!content) return;
    logger.info(`Group: ${metadata.subject}\nSender: ${sender}\nMsg: ${content}`);
  } else {
    if (!message.jid || !message.pushName) return;
    const content = textMsg || message.type;
    if (!content) return;
    logger.info(`From: ${message.jid}\nSender: ${message.pushName}\nMsg: ${content}`);
  }
}
