import {
  getContentType,
  getDevice,
  isJidBroadcast,
  isJidGroup,
  normalizeMessageContent,
} from '#libary';
import { downloadMessage, getConfig, toJid } from '#src';
import { detectType } from 'xstro-utils';

export async function serialize(message, client) {
  const { sudo, prefix, mode, bannedusers } = await getConfig();
  const owner = toJid(client?.user?.id);
  const isGroup = isJidGroup(message.key.remoteJid);
  const isStatus = isJidBroadcast(message.key.remoteJid);

  /** @type string */
  const sender =
    isGroup || isStatus
      ? message?.key?.participant
      : message?.key?.fromMe
        ? owner
        : message.key.remoteJid;

  const msg = normalizeMessageContent(message?.message);
  const type = getContentType(msg);

  const mBody =
    msg?.extendedTextMessage?.text ||
    msg?.extendedTextMessage?.description ||
    msg?.conversation ||
    msg?.imageMessage?.caption ||
    msg?.videoMessage?.caption ||
    msg?.protocolMessage?.editedMessage?.extendedTextMessage?.text ||
    msg?.protocolMessage?.editedMessage?.conversation ||
    msg?.protocolMessage?.editedMessage?.imageMessage?.caption ||
    msg?.protocolMessage?.editedMessage?.videoMessage?.caption ||
    msg?.eventMessage?.description ||
    msg?.eventMessage?.name ||
    msg?.pollCreationMessageV3?.name;

  const quoted = msg?.[type]?.contextInfo;
  const quotedMessage = normalizeMessageContent(quoted?.quotedMessage);
  const quotedType = getContentType(quotedMessage);

  const qBody =
    quotedMessage?.extendedTextMessage?.text ||
    quotedMessage?.extendedTextMessage?.description ||
    quotedMessage?.conversation ||
    quotedMessage?.imageMessage?.caption ||
    quotedMessage?.videoMessage?.caption ||
    quotedMessage?.eventMessage?.description ||
    quotedMessage?.eventMessage?.name ||
    quotedMessage?.pollCreationMessageV3?.name;
  return {
    key: {
      remoteJid: message?.key?.remoteJid,
      fromMe: message?.key?.fromMe,
      id: message?.key?.id,
      participant: message?.key?.participant,
    },
    /** @type string */
    jid: message.key.remoteJid,
    message: msg,
    type: type,
    device: getDevice(message?.key?.id),
    sender,
    prefix,
    mod: mode,
    ban: bannedusers.includes(sender),
    sudo: sender === owner || sudo.includes(sender),
    text: mBody,
    quoted:
      quoted && quotedMessage
        ? {
            key: {
              remoteJid: quoted?.remoteJid || message.key.remoteJid,
              fromMe: quoted.participant === owner,
              id: quoted.stanzaId,
              participant: isGroup ? quoted.participant : undefined,
            },
            message: quotedMessage,
            type: quotedType,
            sender: quoted.participant,
            device: getDevice(quoted.stanzaId),
            ban: bannedusers.includes(quoted.participant),
            sudo: quoted.participant === owner || sudo.includes(quoted.participant),
            text: qBody,
          }
        : undefined,
    send: async function (content, opts = {}) {
      if (!content) throw new Error('Content is required');
      const jid = opts.jid || this.jid;
      const type = opts.type || (await detectType(content));
      const mentions = opts.mentions || quoted?.mentionedJid || [];
      const { contextInfo, ...extras } = opts;
      const msg = await client.sendMessage(
        jid,
        {
          [type]: content,
          contextInfo: { mentionedJid: mentions, ...(contextInfo || {}) },
          ...extras,
        },
        { ...extras }
      );
      return serialize(msg, client);
    },
    edit: async function (content) {
      const key = this?.quoted?.key || this?.key;
      const msg = await client.sendMessage(this.jid, {
        text: content,
        edit: key,
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
    reply: async function (text) {
      const msg = await client.sendMessage(this.jid, { text: text.toString() });
      return serialize(msg, client);
    },
    downloadM: async (message, file = false) => {
      return await downloadMessage(message, file);
    },
    delete: async function () {
      const key = this?.quoted?.key || this.key;
      const msg = await client.sendMessage(this.key.remoteJid, {
        delete: key,
      });
      return serialize(msg, client);
    },
    react: async function (emoji) {
      const key = this?.quoted?.key || this.key;
      const msg = await client.sendMessage(message.key.remoteJid, {
        react: {
          text: emoji,
          key: key,
        },
      });
      return serialize(msg, client);
    },
    user: async (match) => {
      if (match) return toJid(match);
      if (quoted.participant) quoted.participant;
      if (isGroup && quoted?.mentionedJid?.[0]) return quoted.mentionedJid[0];
      if (!isGroup && message.key.remoteJid) return message.key.remoteJid;
      return false;
    },
  };
}
