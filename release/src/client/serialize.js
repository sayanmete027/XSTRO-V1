"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serialize = serialize;
const baileys_1 = require("baileys");
const index_1 = require("../../src/index");
async function serialize(message, client) {
  const {
    sudo,
    prefix,
    mode,
    bannedusers
  } = await (0, index_1.getConfig)();
  const owner = (0, index_1.toJid)(client?.user?.id);
  const isGroup = (0, baileys_1.isJidGroup)(message?.key?.remoteJid);
  const isStatus = (0, baileys_1.isJidBroadcast)(message?.key?.remoteJid);
  const sender = isGroup || isStatus ? message?.key?.participant : message?.key?.fromMe ? owner : message.key.remoteJid;
  const msg = (0, baileys_1.normalizeMessageContent)(message?.message);
  const type = (0, baileys_1.getContentType)(msg);
  const mBody = msg?.extendedTextMessage?.text || msg?.extendedTextMessage?.description || msg?.conversation || msg?.imageMessage?.caption || msg?.videoMessage?.caption || msg?.protocolMessage?.editedMessage?.extendedTextMessage?.text || msg?.protocolMessage?.editedMessage?.conversation || msg?.protocolMessage?.editedMessage?.imageMessage?.caption || msg?.protocolMessage?.editedMessage?.videoMessage?.caption || msg?.eventMessage?.description || msg?.eventMessage?.name || msg?.pollCreationMessageV3?.name;
  function getContextInfo(msg, type) {
    return msg[type];
  }
  const quoted = getContextInfo(msg, type)?.contextInfo;
  const quotedMessage = (0, baileys_1.normalizeMessageContent)(quoted?.quotedMessage);
  const quotedType = (0, baileys_1.getContentType)(quotedMessage);
  const qBody = quotedMessage?.extendedTextMessage?.text || quotedMessage?.extendedTextMessage?.description || quotedMessage?.conversation || quotedMessage?.imageMessage?.caption || quotedMessage?.videoMessage?.caption || quotedMessage?.eventMessage?.description || quotedMessage?.eventMessage?.name || quotedMessage?.pollCreationMessageV3?.name;
  return {
    key: {
      remoteJid: message?.key?.remoteJid,
      fromMe: message?.key?.fromMe,
      id: message?.key?.id,
      participant: message?.key?.participant
    },
    jid: message?.key?.remoteJid,
    owner: (0, index_1.toJid)(client?.user?.id),
    pushName: message?.pushName,
    messageTimestamp: message?.messageTimestamp ?? Date.now(),
    message: msg,
    type: type,
    device: (0, baileys_1.getDevice)(message?.key?.remoteJid),
    sender,
    prefix,
    mod: mode,
    ban: bannedusers.includes(sender),
    sudo: sender === owner || sudo.includes(sender),
    text: mBody,
    quoted: quoted && quotedMessage ? {
      key: {
        remoteJid: quoted?.remoteJid || message.key.remoteJid,
        fromMe: quoted.participant === owner,
        id: quoted.stanzaId,
        participant: isGroup ? quoted.participant : undefined
      },
      message: quotedMessage,
      type: quotedType,
      sender: quoted.participant,
      device: (0, baileys_1.getDevice)(quoted.stanzaId),
      ban: bannedusers.includes(quoted.participant),
      sudo: quoted.participant === owner || sudo.includes(quoted.participant),
      text: qBody,
      image: quotedType === 'imageMessage',
      video: quotedType === 'videoMessage',
      audio: quotedType === 'audioMessage',
      document: quotedType === 'documentMessage',
      viewonce: quotedMessage?.imageMessage?.viewOnce || quotedMessage?.videoMessage?.viewOnce || quotedMessage?.audioMessage?.viewOnce
    } : undefined,
    send: async function (content, options) {
      if (!content) return;
      const type = await (0, index_1.detectType)(content);
      if (type === 'text') {
        const message = await client.sendMessage(this.jid, {
          text: content.toString(),
          ...options
        }, {
          ...options
        });
        return serialize(message, client);
      } else if (type === 'video') {
        const message = await client.sendMessage(this.jid, {
          video: Buffer.from(content),
          ...options
        }, {
          ...options
        });
        return serialize(message, client);
      } else if (type === 'image') {
        const message = await client.sendMessage(this.jid, {
          image: Buffer.from(content),
          ...options
        }, {
          ...options
        });
        return serialize(message, client);
      } else if (type === 'sticker') {
        const message = await client.sendMessage(this.jid, {
          sticker: Buffer.from(content),
          ...options
        }, {
          ...options
        });
        return serialize(message, client);
      }
    },
    edit: async function (content) {
      const key = this?.quoted?.key || this?.key;
      const msg = await client.sendMessage(this.jid, {
        text: content,
        edit: key
      });
      return serialize(msg, client);
    },
    forward: async (jid, message, opts = {}) => {
      if (!jid || !message) throw new Error('No jid or message provided');
      return await client.sendMessage(jid, {
        forward: message,
        contextInfo: {
          ...opts
        },
        ...opts
      }, {
        ...opts
      });
    },
    reply: async function (text) {
      const msg = await client.sendMessage(this.jid, {
        text: text.toString()
      });
      return serialize(msg, client);
    },
    downloadM: async (message, file = false) => {
      return await (0, index_1.downloadMessage)(message, file);
    },
    delete: async function () {
      const key = this?.quoted?.key || this.key;
      const msg = await client.sendMessage(this.jid, {
        delete: key
      });
      return serialize(msg, client);
    },
    react: async function (emoji) {
      const key = this?.quoted?.key || this.key;
      const msg = await client.sendMessage(this.jid, {
        react: {
          text: emoji,
          key: key
        }
      });
      return serialize(msg, client);
    },
    user: async match => {
      if (match) return (0, index_1.toJid)(match);
      if (quoted.participant) quoted.participant;
      if (isGroup && quoted?.mentionedJid?.[0]) return quoted.mentionedJid[0];
      if (!isGroup && message.key.remoteJid) return message.key.remoteJid;
      return false;
    },
    client: client
  };
}