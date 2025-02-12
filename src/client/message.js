import { detectType } from 'xstro-utils';
import { downloadMessage, toJid, LANG } from '#src';

class Message {
  constructor(client, data) {
    Object.defineProperties(this, {
      client: { value: client, writable: true, configurable: true },
      data: { value: data, writable: true, configurable: true },
    });
    if (data) this._events(data);
  }

  _events(data) {
    this.data = data;
    this.key = data.key;
    this.id = data.key.id;
    this.jid = data.key.remoteJid;
    this.isGroup = data.isGroup;
    this.fromMe = data.key.fromMe;
    this.pushName = data.pushName;
    this.message = data.message;
    this.prefix = data.prefix;
    this.sender = data.sender;
    this.mtype = data.type;
    this.user = data.user;
    this.sudo = data.sudo;
    this.mode = data.mode;
    this.timestamp = data.messageTimestamp;
    this.text = data.body;
    this.mention = data.mention;
    this.quoted = data.quoted;

    if (data.quoted) {
      const quoted = data.quoted;
      this.reply_message = {
        id: quoted.key.id,
        fromMe: quoted.key.fromMe,
        sender: quoted.sender,
        key: quoted.key,
        mtype: quoted.mtype,
        message: quoted.message,
        text: quoted.body,
        status: quoted.isStatus,
        image: Boolean(quoted.message?.imageMessage),
        video: Boolean(quoted.message?.videoMessage),
        audio: Boolean(quoted.message?.audioMessage),
        sticker: Boolean(quoted.message?.stickerMessage),
        document: Boolean(quoted.message?.documentMessage),
        viewonce: quoted.viewonce,
      };
    } else {
      this.reply_message = undefined;
    }
  }

  async getAdmin() {
    if (!(await this.data.isAdmin())) {
      await this.send(LANG.ISADMIN);
      return false;
    }
    if (!(await this.data.isBotAdmin())) {
      await this.send(LANG.ISBOTADMIN);
      return false;
    }
    return true;
  }

  async msgId(match) {
    return this.isGroup
      ? match
        ? toJid(match)
        : this.reply_message?.sender
          ? this.reply_message.sender
          : this.mention?.[0]
            ? this.mention[0]
            : false
      : match
        ? toJid(match)
        : this.reply_message?.sender
          ? this.reply_message.sender
          : this.jid
            ? this.jid
            : false;
  }

  async reply(text) {
    return new Message(
      this.client,
      await this.client.sendMessage(this.jid, {
        text: text.trim().toString(),
        contextInfo: {
          externalAdReply: {
            title: this.pushName,
            body: LANG.BOT_NAME,
            mediaType: 1,
            mediaUrl: LANG.THUMBNAIL,
            thumbnailUrl: LANG.THUMBNAIL,
            sourceUrl: LANG.REPO_URL,
            showAdAttribution: true,
          },
        },
      })
    );
  }

  async edit(content) {
    const msg = await this.client.sendMessage(this.jid, {
      text: content,
      edit: this.data?.quoted?.key || this.key,
    });
    return new Message(this.client, msg);
  }

  async react(emoji, opts = {}) {
    const msg = await this.client.sendMessage(this.jid, {
      react: { text: emoji, key: opts.key || this.key },
    });
    return new Message(this.client, msg);
  }

  async delete() {
    const msg = await this.client.sendMessage(this.jid, {
      delete: this.reply_message?.key || this.key,
    });
    return new Message(this.client, msg);
  }

  async send(content, opts = {}) {
    const jid = opts.jid || this.jid;
    const type = opts.type || (await detectType(content));
    const mentions = opts.mentions || this.mention;
    const quoted = opts?.quoted?.key?.id
      ? opts.quoted
      : this?.quoted?.key?.id
        ? this.quoted
        : this.data;
    const msg = await this.client.sendMessage(
      jid,
      {
        [type]: content,
        contextInfo: { mentionedJid: mentions, ...opts },
        ...opts,
      },
      { quoted: quoted }
    );
    return new Message(this.client, msg);
  }

  async forward(jid, message, opts = {}) {
    if (!jid || !message) throw new Error('No jid or message provided');
    return new Message(
      this.client,
      await this.client.sendMessage(
        jid,
        { forward: message, contextInfo: { ...opts }, ...opts },
        { ...opts }
      )
    );
  }

  async download(file = false) {
    return await downloadMessage(this.data?.quoted || this.data?.message, file);
  }
}

export default Message;
