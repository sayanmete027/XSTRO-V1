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
  /** Configurations from the database */
  const { PREFIX, mode } = await getConfig();
  /** The chat where the message came from */
  const from = messages.key.remoteJid;
  /** The normalized message (This will make all kinds of messages such as Epehermal and Viewonce Messages to apppear normal and easy to work with) */
  const message = normalizeMessageContent(messages?.message ?? {});
  /** The new type of normal message we have received */
  const mtype = getContentType(message) ?? undefined;
  /** The number running the bot currently */
  const owner = toJid(client?.user?.id);

  /** Universal (Orginal | Author) of the sent message (Dynamic for Personal, Groups and Status, Excluding NewsLetters) */
  const sender =
    isJidGroup(from) || isJidBroadcast(from)
      ? (messages?.key?.participant ?? undefined)
      : messages?.key?.fromMe
        ? (owner ?? undefined)
        : from;

  /** Is the sender of the Message a Sudo User? */
  const sudo = (await isSudo(sender)) ?? undefined;
  /** Is the sender of the Message a Banned User? */
  const isban = (await isBanned(sender)) ?? undefined;
  /** Was the received Message from a Group (True Yes | False No) */
  const isGroup = isJidGroup(from) ?? undefined;
  /** Was the received Message from a Channel (NewsLetter) */
  const isChannel = isJidNewsletter(from);

  /** Device name of the sender */
  const deviceName = getDevice(messages.key.id) ?? undefined;

  /** Extract the body such as the poll name, and options from a poll message (Use for Antilink) */
  const pollMessageData = message?.pollCreationMessageV3
    ? `${message.pollCreationMessageV3.name}\n${message.pollCreationMessageV3.options?.map((pollValue) => pollValue?.optionName).join('\n') || ''}`
    : undefined;

  /** Extract the body such as title and description from a Event Message */
  const eventMessageData = message?.eventMessage
    ? `${message.eventMessage.name || ''}\n${message.eventMessage.description || ''}`.trim()
    : undefined;

  /** Extract All the text from every normal kind of message, Text, Image, Video, Event, Poll etc */

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

  /** Is the Message Quoted? Else NO */
  const quoted = message?.[mtype]?.contextInfo || undefined;
  /** Propeties calls */
  let quotedMsg;
  /**Below Rebuilt the quoted to make it easier to work with for the rest of the bot */
  if (quoted) {
    /** The sender, it's id and the quotedMessage of the quotedMessage with extras spreads */
    const { participant, stanzaId, quotedMessage, remoteJid, ...remainingProps } = quoted;

    /** Simplified extracted message of the quoted */
    const qmessage = normalizeMessageContent(quotedMessage) || undefined;

    /** Type of message we quoted */
    const qmtype = getContentType(qmessage) || undefined;

    /** Same for non_quoted messages, we extract the body of the replied quoted Message */
    const quotedBody =
      qmessage?.conversation || qmessage?.extendedTextMessage?.text || qmessage?.[qmtype]?.caption;

    /** Build the quoted message body with adjusted remoteJid and participant */
    quotedMsg =
      {
        key: {
          remoteJid: remoteJid || from, // If remoteJid exists in quoted, use that, else default to from
          fromMe: participant === owner,
          id: stanzaId,
          participant: remoteJid ? participant : isGroup ? participant : undefined, // Update participant if remoteJid exists for status reply
        },
        isStatus: remoteJid || false,
        sender: remoteJid ? participant : participant, // Ensure participant is correct based on remoteJid
        message: qmessage,
        type: qmtype,
        sudo: await isSudo(participant),
        isban: await isBanned(participant),
        body: quotedBody,
        viewonce: qmessage?.[qmtype]?.viewOnce,
        ...remainingProps,
      } || undefined;
  }

  /** Seralized Abstarct Object for easy usage, and control  */
  const msg = {
    /** Message key */
    key: messages?.key ?? undefined,
    /** Name of message sender if avaliable */
    pushName: messages?.pushName ?? undefined,
    /** Timestamp of when message was sent */
    messageTimestamp: messages?.messageTimestamp ?? undefined,
    /** Is that message sender an Admin? */
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
    /** Source of the message */
    from: from,
    /** Owner/user identifier */
    user: owner,
    /** Device name of the sender */
    device: deviceName,
    /** Elevated privileges flag */
    sudo,
    /** Ban status flag */
    isban,
    /** Operating mode */
    mode: mode,
    /** Command prefix */
    prefix: PREFIX,
    /** Group chat indicator */
    isGroup,
    /** Channel indicator */
    isChannel,
    /** Message sender identifier */
    sender,
    /** Message type */
    type: mtype,
    /** Broadcast message flag */
    broadcast: messages?.broadcast ?? undefined,
    /** Message status */
    mstatus: messages?.status ?? undefined,
    /** Verified business name if applicable */
    verifiedBizName: messages?.verifiedBizName ?? undefined,
    /** Complete message object */
    message,
    /** Message content/text */
    body: body || undefined,
    /** Is the Message A Viewonce */
    viewonce: message?.[mtype]?.viewOnce || false,
    /** Mentioned JID */
    mention: quoted?.mentionedJid || [],
    /** Referenced/quoted message */
    quoted: quotedMsg,

    /**
     * Raw Message Sending Direct from seralized
     * @param {WAProto.IMessage} message - Message Content Here
     * @param {WAProto.IMessageContextInfo} opts - Misc Generation Options
     * @returns {WAProto.IWebMessageInfo}
     */
    send: async (message, opts = {}) => {
      const jid = opts.jid || from;
      const data = await client.sendMessage(
        jid,
        { [opts.type || 'text']: message, ...opts },
        { quoted: msg || opts.quoted }
      );
      return serialize(data, client);
    },

    /**
     * Handles Errors Caused by A Command
     * @param {string} cmd - Command Name
     * @param {Error} error - Command Error
     * @returns {Promise<void>}
     */
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
