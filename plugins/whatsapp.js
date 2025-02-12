import config from '#config';
import { bot, LANG, toJid } from '#src';
import { isJidGroup } from '#libary';

bot(
  {
    pattern: 'vv',
    public: false,
    desc: 'Forwards A Viewonce Message',
    type: 'whatsapp',
  },
  async (message, _, { user, quoted, reply_message }) => {
    if (!reply_message || !reply_message.viewonce) return message.send(LANG.VIEWONCE);
    quoted.message[quoted.type].viewOnce = false;
    return message.forward(user.id, quoted, { quoted: quoted });
  }
);

bot(
  {
    pattern: 'tovv',
    public: true,
    desc: 'Make A Message To Viewonce',
    type: 'whatsapp',
  },
  async (message, _, { jid, quoted, reply_message }) => {
    if (!reply_message || (!reply_message.video && !reply_message.audio && !reply_message.image))
      return message.send(LANG.MEDIA);
    quoted.message[quoted.type].viewOnce = true;
    return message.forward(jid, quoted, { quoted: quoted });
  }
);

bot(
  {
    pattern: 'myname',
    public: false,
    type: 'whatsapp',
    desc: 'Changes your WhatsApp Name',
  },
  async (message, match, { updateProfileName }) => {
    if (!match) return message.reply('Provide A New Name');
    await updateProfileName(match);
    return message.reply('WhatsApp Name Updated!');
  }
);

bot(
  {
    pattern: 'setpp',
    public: false,
    type: 'whatsapp',
    desc: 'Set Your Profile Picture',
  },
  async (message, _, { user, updateProfilePicture }) => {
    if (!message.reply_message?.image) return message.send(LANG.IMAGE);
    const img = await message.download();
    await updateProfilePicture(user.id, img);
    return await message.send('Profile Picture Updated');
  }
);

bot(
  {
    pattern: 'quoted',
    public: false,
    type: 'whatsapp',
    desc: 'quoted message',
  },
  async (message, _, { jid, quoted, loadMessage }) => {
    if (!quoted || !quoted?.message) return message.send('Reply A Message');
    let msg;
    msg = quoted;
    msg = await loadMessage(msg.key.id);
    if (!msg) return message.send('Message Not Found');
    return await message.forward(jid, msg.quoted, { quoted: msg.quoted });
  }
);

bot(
  {
    pattern: 'save',
    public: false,
    type: 'whatsapp',
    desc: 'Saves Status',
  },
  async (message, _, { user, reply_message, quoted }) => {
    if (!reply_message || !reply_message.status) return message.send(LANG.STATUS);
    return await message.forward(user.id, quoted, { quoted: quoted });
  }
);

bot(
  {
    pattern: 'dlt',
    public: false,
    type: 'whatsapp',
    desc: 'Deletes Message',
  },
  async (message, _, { reply_message }) => {
    if (!reply_message) return message.send(LANG.MESSAGE);
    return await message.delete();
  }
);

bot(
  {
    pattern: 'archive',
    public: false,
    type: 'whatsapp',
    desc: 'archive whatsapp chat',
  },
  async (message, _, { jid, chatModify, key, timestamp }) => {
    await chatModify(
      {
        archive: true,
        lastMessages: [{ message: message, key: key, messageTimestamp: timestamp }],
      },
      jid
    );
    await message.send('Archived');
  }
);

bot(
  {
    pattern: 'unarchive',
    public: false,
    type: 'whatsapp',
    desc: 'unarchive whatsapp chat',
  },
  async (message, _, { jid, chatModify, key, timestamp }) => {
    await chatModify(
      {
        archive: false,
        lastMessages: [{ message: message, key: key, messageTimestamp: timestamp }],
      },
      jid
    );
    await message.send('Unarchived');
  }
);

bot(
  {
    pattern: 'delete',
    public: false,
    type: 'whatsapp',
    desc: 'Deletes A chat',
  },
  async (message, _, { jid, key, chatModify }) => {
    await chatModify(
      {
        delete: true,
        lastMessages: [
          {
            key: key,
            messageTimestamp: Date.now(),
          },
        ],
      },
      jid
    );
  }
);

bot(
  {
    pattern: 'onwa',
    public: true,
    type: 'whatsapp',
    desc: 'Checks if users exist on WhatsApp',
  },
  async (message, match, { onWhatsApp }) => {
    if (!match) return message.send('Provide their numbers, e.g. 121232343,131312424');
    match = match.split(',').map((id) => toJid(id.trim()));
    const res = await onWhatsApp(...match);
    if (!res.length) return message.send('None of the numbers exist on WhatsApp.');
    const existingNumbers = res.filter((user) => user.exists).map((user) => user.jid.split('@')[0]);
    const nonExistingNumbers = match
      .filter((id) => !res.some((user) => user.jid === id && user.exists))
      .map((id) => id.split('@')[0]);
    let info = '*Checked numbers:*\n\n';
    if (existingNumbers.length) info += `*Exists:*\n @${existingNumbers.join('\n@')}\n`;
    if (nonExistingNumbers.length) info += `\n*Does not exist:*\n ${nonExistingNumbers.join('\n')}`;
    return message.send(info, { mentions: existingNumbers.map((num) => toJid(num)) });
  }
);

bot(
  {
    pattern: 'blocklist',
    public: false,
    type: 'whatsapp',
    desc: 'Fetches BlockList',
  },
  async (message, _, { fetchBlocklist }) => {
    const blocklist = await fetchBlocklist();
    if (blocklist.length > 0) {
      const mentions = blocklist.map((number) => `${number}`);
      const blocked = blocklist.map((number) => `• @${number.split('@')[0]}`).join('\n');
      await message.send(`*Blocked contacts:*\n\n${blocked}`, { mentions });
    } else {
      await message.send('No blocked Numbers!');
    }
  }
);

bot(
  {
    pattern: 'clear',
    public: false,
    type: 'whatsapp',
    desc: 'delete whatsapp chat',
  },
  async (message, _, { jid, key, timestamp, chatModify }) => {
    await chatModify(
      {
        delete: true,
        lastMessages: [
          {
            key: key,
            messageTimestamp: timestamp,
          },
        ],
      },
      jid
    );
    await message.send('Cleared');
  }
);

bot(
  {
    pattern: 'rpp',
    public: false,
    type: 'whatsapp',
    desc: 'Removes Profile Picture',
  },
  async (message, _, { user, removeProfilePicture }) => {
    await removeProfilePicture(user.id);
    return message.send('Profile Picture Removed!');
  }
);

bot(
  {
    pattern: 'pin',
    public: false,
    type: 'whatsapp',
    desc: 'pin a chat',
  },
  async (message, _, { jid, chatModify }) => {
    await chatModify({ pin: true }, jid);
    return message.send('Pined');
  }
);

bot(
  {
    pattern: 'unpin',
    public: false,
    type: 'whatsapp',
    desc: 'unpin a msg',
  },
  async (message, _, { jid, chatModify }) => {
    await chatModify({ pin: false }, jid);
    return message.send('Unpined');
  }
);

bot(
  {
    pattern: 'forward',
    public: false,
    type: 'whatsapp',
    desc: 'Forwards A Replied Message',
  },
  async (message, match, { reply_message, quoted }) => {
    if (!reply_message) return message.send('Reply A Message!');
    const jid = await message.msgId(match);
    if (!jid) return message.send('Reply someone or mention or provide a number');
    await message.forward(jid, quoted, { quoted: quoted });
    return await message.send(`Forwarded to @${jid.split('@')[0]}`, { mentions: [jid] });
  }
);

bot(
  {
    pattern: 'block',
    public: false,
    type: 'whatsapp',
    desc: 'Blocks A Person',
  },
  async (message, match, { updateBlockStatus }) => {
    const jid = await message.msgId(match);
    if (!jid) return;
    await updateBlockStatus(jid, 'block');
  }
);

bot(
  {
    pattern: 'unblock',
    public: false,
    type: 'whatsapp',
    desc: 'Unblocks A Person',
  },
  async (message, match, { updateBlockStatus }) => {
    const jid = await message.msgId(match);
    if (!jid) return;
    await updateBlockStatus(jid, 'unblock');
  }
);

bot(
  {
    pattern: 'edit',
    public: false,
    type: 'whatsapp',
    desc: 'Edits A Sent Message',
  },
  async (message, match, { prefix, reply_message, quoted }) => {
    if (!reply_message) return message.send('Reply your message to edit');
    if (!match) return await message.send(`Usage: ${prefix}edit <new message>`);
    if (!quoted.key.fromMe) return message.send('Cannot edit messages sent by others');
    await message.edit(match);
  }
);

bot(
  {
    pattern: 'jid',
    public: true,
    type: 'whatsapp',
    desc: 'Get Jid of Current Chat',
  },
  async (message, match, { jid, reply_message }) => {
    let id;
    if (reply_message) {
      id = reply_message.sender;
    } else if (message.mention && message.mention.length > 0) {
      id = message.mention[0];
    } else if (match) {
      id = toJid(match);
    } else {
      id = jid;
    }
    return await message.send(id);
  }
);

bot(
  {
    pattern: 'bio',
    public: true,
    type: 'whatsapp',
    desc: 'Change your whatsapp bio',
  },
  async (message, match, { prefix, updateProfileStatus }) => {
    if (!match) return message.send(`Usage:_\n_${prefix}bio Hello World`);
    await updateProfileStatus(match);
    return await message.send('WhatsApp bio Updated to "' + match + '"');
  }
);

bot(
  {
    pattern: 'react',
    public: false,
    type: 'whatsapp',
    desc: 'React to A Message',
  },
  async (message, match, { jid, sendMessage, reply_message }) => {
    if (!reply_message) return message.send('Reply Message');
    if (!match) return message.send('react 😊');
    return await sendMessage(jid, {
      react: { text: match, key: reply_message.key },
    });
  }
);

bot(
  {
    pattern: 'star',
    public: false,
    type: 'whatsapp',
    desc: 'Stars or Unstars a Message',
  },
  async (message, _, { star }) => {
    if (!message.reply_message) return message.send(LANG.MESSAGE);
    const messages = [{ id: message.reply_message.id, fromMe: message.reply_message.fromMe }];
    return await star(message.jid, messages, true);
  }
);

bot(
  {
    pattern: 'unstar',
    public: false,
    type: 'whatsapp',
    desc: 'Stars or Unstars a Message',
  },
  async (message, _, { star, jid, reply_message }) => {
    if (!reply_message) return message.send(LANG.MESSAGE);
    const messages = [{ id: reply_message.id, fromMe: reply_message.fromMe }];
    await star(jid, messages, false);
  }
);

bot(
  {
    pattern: 'owner',
    public: true,
    type: 'whatsapp',
    desc: 'Get Bot Owner',
  },
  async (message, _, { jid, user, getName, sendMessage }) => {
    const botOwner = toJid(user.id);
    const name = await getName(botOwner);
    const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${name}
ORG:${config.BOT_INFO.split(';')[0]}
TEL;type=CELL;type=VOICE;waid=${message.user.split('@')[0]}:${message.user.split('@')[0]}
END:VCARD
`;

    return await sendMessage(jid, {
      contacts: {
        displayName: name,
        contacts: [{ vcard }],
      },
    });
  }
);

bot(
  {
    pattern: 'gforward',
    public: false,
    type: 'whatsapp',
    desc: 'Forwards a replied message to multiple groups',
  },
  async (message, match, { quoted }) => {
    if (!message.reply_message) return message.send('Reply A Message to forward to Groups');
    if (!match) return message.send('Provide a comma-separated list of group JIDs');
    const groupJids = match
      .split(',')
      .map((jid) => jid.trim())
      .filter(isJidGroup);

    await Promise.all(groupJids.map((jid) => message.forward(jid, quoted, { quoted: quoted })));
    return message.send(`Forwarded to ${groupJids.length} group(s).`);
  }
);

bot(
  {
    pattern: 'ptv',
    public: true,
    desc: 'Convert video to pvt video note',
    type: 'whatsapp',
  },
  async (message, _, { reply_message }) => {
    let media;
    if (!reply_message || !reply_message.video) return message.send(LANG.VIDEO);
    media = await message.download();
    return await message.send(media, { ptv: true });
  }
);
