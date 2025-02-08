import { bot } from '#src';
import { getContacts } from '#sql';
import { createVCard, toJid } from '#utils';

bot(
  {
    pattern: 'contacts',
    public: false,
    desc: 'Get all contacts saved by bot',
    type: 'contacts',
  },
  async (message) => {
    const contacts = await getContacts();
    if (!contacts.length) return await message.send('_No contacts saved yet_');
    const contactList = contacts.map((c) => `*${c.name}:* _${c.jid.split('@')[0]}_`).join('\n');
    return await message.send(`*ᴄᴏɴᴛᴀᴄᴛs sᴀᴠᴇᴅ ʙʏ ʙᴏᴛ*\n\n${contactList}`);
  }
);

bot(
  {
    pattern: 'savecontact',
    public: false,
    desc: 'Save A Contact to the bot',
    type: 'contacts',
  },
  async (message, match, { jid, prefix, onWhatsApp, sendMessage }) => {
    if (!match) return message.send(prefix + 'savecontact Astro|12345678901 To Save a contact');
    match = match.split('|');
    if (!(await onWhatsApp(toJid(match[1]))))
      return message.send('That Number does npt exist on WhatsApp');
    const contact = createVCard(match[0], [match[1]]);
    return await sendMessage(jid, {
      document: contact,
      mimetype: 'text/vcard',
      fileName: 'contact.vcf',
    });
  }
);

bot(
  {
    pattern: 'vcf',
    public: true,
    isGroup: true,
    type: 'contacts',
  },
  async (message, _, { jid, groupMetadata, getName, sendMessage }) => {
    const { subject, participants } = await groupMetadata(jid);

    let counter = 1;
    const contacts = participants.map(({ id }) => {
      const name = getName(id) || `${subject} ${counter++}`;
      return `
BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;TYPE=CELL:${id.replace(/@.+/, '')}
END:VCARD
`.trim();
    });
    const vCardContent = contacts.join('\n');
    const vCardBuffer = Buffer.from(vCardContent, 'utf-8');
    await sendMessage(jid, {
      document: vCardBuffer,
      mimetype: 'text/vcard',
      fileName: `${subject}_contacts.vcf`,
    });
    await message.send(`Created a vcf for ${participants.length} members`);
  }
);
