import {
  getContentType,
  getDevice,
  isJidBroadcast,
  isJidGroup,
  isJidNewsletter,
  normalizeMessageContent,
} from '#libary';
import { downloadMessage, getConfig, LANG, toJid } from '#src';
import { detectType } from 'xstro-utils';

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
    send: async (content, opts = {}) => {
      if (!content) throw new Error('Content is required');
      const jid = opts.jid || from;
      const type = opts.type || (await detectType(content));
      const mentions = opts.mentions || quoted?.mentionedJid || [];
      const { contextInfo, ...restOpts } = opts;
      const msg = await client.sendMessage(jid, {
        [type]: content,
        contextInfo: { mentionedJid: mentions, ...(contextInfo || {}) },
        ...restOpts,
      });
      return serialize(msg, client);
    },
    edit: async (content) => {
      const msg = await client.sendMessage(from, {
        text: content,
        edit: messages.key || quotedMsg?.key,
      });
      return serialize(msg, client);
    },
    forward: async (jid, message, opts = {}) => {
      if (!jid || !message) throw new Error('No jid or message provided');
      return await client.sendMessage(
        jid,
        { forward: message, contextInfo: { ...opts }, ...opts },
        { ...opts }
      );
    },
    downloadM: async (file = false) => {
      return await downloadMessage(quotedMsg, file);
    },
    msgId: async (match) => {
      if (match) return toJid(match);
      if (quotedMsg?.sender) return quotedMsg.sender;
      if (isGroup && quoted?.mentionedJid?.[0]) return quoted.mentionedJid[0];
      if (!isGroup && from) return from;
      return false;
    },
    reply: async (text) => {
      const msg = await client.sendMessage(from, {
        text: text.toString(),
        contextInfo: {
          externalAdReply: {
            title: messages.pushName,
            body: LANG.BOT_NAME,
            mediaType: 1,
            mediaUrl: LANG.THUMBNAIL,
            thumbnailUrl: LANG.THUMBNAIL,
            sourceUrl: LANG.REPO_URL,
            showAdAttribution: true,
          },
        },
      });
      return serialize(msg, client);
    },
    react: async (emoji, opts = {}) => {
      const msg = await client.sendMessage(from, {
        react: {
          text: emoji,
          key: messages.key || opts.key,
        },
      });
      return serialize(msg, client);
    },
    delete: async () => {
      const msg = await client.sendMessage(from, {
        delete: messages.key || quotedMsg?.key,
      });
      return serialize(msg, client);
    },
    error: async (cmd, error) => {
      await msg.send(LANG.COMMAND_ERROR_MSG);
      const name = cmd.name.toString().toLowerCase().split(/\W+/)[2];
      const errorMessage = `─━❲ ERROR REPORT ❳━─\nCMD: ${name}\nINFO: ${error.message}`;
      await msg.send('```' + errorMessage + '```', { jid: owner });
      console.log(error.stack);
    },
  };
  return msg;
}
