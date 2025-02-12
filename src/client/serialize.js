import {
  getContentType,
  getDevice,
  isJidBroadcast,
  isJidGroup,
  isJidNewsletter,
  normalizeMessageContent,
} from '#libary';
import { getConfig, LANG, toJid } from '#src';

export async function serialize(messages, client) {
  const { prefix, mode, sudo } = await getConfig();
  const from = messages.key.remoteJid;
  const message = normalizeMessageContent(messages?.message ?? {});
  const mtype = getContentType(message);
  const owner = toJid(client?.user?.id);
  const sender =
    isJidGroup(from) || isJidBroadcast(from)
      ? messages?.key?.participant
      : messages?.key?.fromMe
        ? owner
        : from;
  const sudos = sender === owner || sudo.includes(sender);
  const isGroup = isJidGroup(from);
  const isChannel = isJidNewsletter(from);
  const deviceName = getDevice(messages.key.id);

  const pollMessageData = message?.pollCreationMessageV3
    ? `${message.pollCreationMessageV3.name}\n${message.pollCreationMessageV3.options?.map((pollValue) => pollValue?.optionName).join('\n') || ''}`
    : undefined;
  const eventMessageData = message?.eventMessage
    ? `${message.eventMessage.name || ''}\n${message.eventMessage.description || ''}`.trim()
    : undefined;

  const body =
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.[mtype]?.caption ||
    message?.protocolMessage?.editedMessage?.conversation ||
    message?.protocolMessage?.editedMessage?.extendedTextMessage?.text ||
    message?.protocolMessage?.editedMessage?.imageMessage?.caption ||
    message?.protocolMessage?.editedMessage?.videoMessage?.caption ||
    message?.protocolMessage?.editedMessage ||
    pollMessageData ||
    eventMessageData;

  const quoted = message?.[mtype]?.contextInfo;
  let quotedMsg = undefined;
  if (quoted) {
    const { participant, stanzaId, quotedMessage, remoteJid, ...remainingProps } = quoted;
    const qmessage = normalizeMessageContent(quotedMessage);
    const qmtype = getContentType(qmessage);
    const quotedBody =
      qmessage?.conversation || qmessage?.extendedTextMessage?.text || qmessage?.[qmtype]?.caption;
    quotedMsg = {
      key: {
        remoteJid: remoteJid || from,
        fromMe: participant === owner,
        id: stanzaId,
        participant: remoteJid ? participant : isGroup ? participant : undefined,
      },
      isStatus: remoteJid || false,
      sender: remoteJid ? participant : participant,
      message: qmessage,
      type: qmtype,
      body: quotedBody,
      viewonce: qmessage?.[qmtype]?.viewOnce,
      ...remainingProps,
    };
  }

  const msg = {
    key: messages?.key,
    pushName: messages?.pushName,
    messageTimestamp: messages?.messageTimestamp,
    isAdmin: async () => {
      if (!isGroup) return undefined;
      const { participants } = await client.groupMetadata(from);
      return participants.some((p) => p.id === sender && p.admin) || false;
    },
    isBotAdmin: async () => {
      if (!isGroup) return undefined;
      const { participants } = await client.groupMetadata(from);
      return participants.some((p) => p.id === owner && p.admin) || false;
    },
    from,
    sudo: sudos,
    user: owner,
    device: deviceName,
    mode,
    prefix,
    isGroup,
    isChannel,
    sender,
    type: mtype,
    broadcast: messages?.broadcast,
    mstatus: messages?.status,
    verifiedBizName: messages?.verifiedBizName,
    message,
    body: body || undefined,
    viewonce: message?.[mtype]?.viewOnce || false,
    mention: quoted?.mentionedJid || [],
    quoted: quotedMsg,
    send: async (message, opts = {}) => {
      const jid = opts.jid || from;
      const data = await client.sendMessage(
        jid,
        { [opts.type || 'text']: message, ...opts },
        { quoted: msg || opts.quoted }
      );
      return serialize(data, client);
    },
    error: async (cmd, error) => {
      await msg.send(LANG.COMMAND_ERROR_MSG);
      const name = cmd.name.toString().toLowerCase().split(/\W+/)[2] || cmd.on;
      const errorMessage = `─━❲ ERROR REPORT ❳━─\nCMD: ${name}\nINFO: ${error.message}`;
      await msg.send('```' + errorMessage + '```', { jid: owner });
      console.log(error.stack);
    },
    client: async () => client,
  };
  return msg;
}
