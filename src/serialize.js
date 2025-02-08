import {
  getContentType,
  getDevice,
  isJidBroadcast,
  isJidGroup,
  isJidNewsletter,
  normalizeMessageContent,
  WAProto,
} from '#libary';
import { toJid } from '#utils';
import { getConfig, isBanned, isSudo } from '#sql';
import { LANG } from '#extension';

export async function serialize(messages, client) {
  const { prefix, mode } = await getConfig();
  const from = messages.key.remoteJid;
  const message = normalizeMessageContent(messages?.message ?? {});
  const mtype = getContentType(message) ?? undefined;
  const owner = toJid(client?.user?.id);
  const sender =
    isJidGroup(from) || isJidBroadcast(from)
      ? (messages?.key?.participant ?? undefined)
      : messages?.key?.fromMe
        ? (owner ?? undefined)
        : from;
  const sudo = (await isSudo(sender)) ?? undefined;
  const isban = (await isBanned(sender)) ?? undefined;
  const isGroup = isJidGroup(from) ?? undefined;
  const isChannel = isJidNewsletter(from);
  const deviceName = getDevice(messages.key.id) ?? undefined;
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
    message?.protocolMessage?.editedMessage?.extendedTextMessage.text ||
    message?.protocolMessage?.editedMessage?.imageMessage?.caption ||
    message?.protocolMessage?.editedMessage?.videoMessage?.caption ||
    message?.protocolMessage?.editedMessage ||
    pollMessageData ||
    eventMessageData;
  const quoted = message?.[mtype]?.contextInfo || undefined;
  let quotedMsg;
  if (quoted) {
    const { participant, stanzaId, quotedMessage, remoteJid, ...remainingProps } = quoted;
    const qmessage = normalizeMessageContent(quotedMessage) || undefined;
    const qmtype = getContentType(qmessage) || undefined;
    const quotedBody =
      qmessage?.conversation || qmessage?.extendedTextMessage?.text || qmessage?.[qmtype]?.caption;
    quotedMsg =
      {
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
        sudo: await isSudo(participant),
        isban: await isBanned(participant),
        body: quotedBody,
        viewonce: qmessage?.[qmtype]?.viewOnce,
        ...remainingProps,
      } || undefined;
  }
  const msg = {
    key: messages?.key ?? undefined,
    pushName: messages?.pushName ?? undefined,
    messageTimestamp: messages?.messageTimestamp ?? undefined,
    isAdmin: async () => {
      if (!isGroup) return undefined;
      const { participants } = await client.groupMetadata(from);
      return !!participants.find((p) => p.id === sender)?.admin || false;
    },
    isBotAdmin: async () => {
      if (!isGroup) return undefined;
      const { participants } = await client.groupMetadata(from);
      return !!participants.find((p) => p.id === owner)?.admin || false;
    },
    from: from,
    user: owner,
    device: deviceName,
    sudo,
    isban,
    mode: mode,
    prefix: prefix,
    isGroup,
    isChannel,
    sender,
    type: mtype,
    broadcast: messages?.broadcast ?? undefined,
    mstatus: messages?.status ?? undefined,
    verifiedBizName: messages?.verifiedBizName ?? undefined,
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
      msg.send(LANG.COMMAND_ERROR_MSG);
      const name = cmd.pattern.toString().toLowerCase().split(/\W+/)[2];
      const { stack, message } = error;
      const errorMessage = `─━❲ ERROR REPORT ❳━─\nCMD: ${name}\nINFO: ${message}`;
      const data = msg.send('```' + errorMessage + '```', {
        jid: owner,
      });
      return serialize(data, client) && console.log(stack);
    },
    client: async () => {
      return client;
    },
  };
  return msg;
}
