import { Module, getContacts } from '#src';

Module(
  {
    name: 'contacts',
    fromMe: true,
    desc: 'Get all contacts saved by Module',
    type: 'contacts',
  },
  async (message) => {
    const contacts = await getContacts();
    if (!contacts.length) return await message.send('No contacts saved yet');
    const contactList = contacts.map((c) => `*${c.name}:* _${c.jid.split('@')[0]}`).join('\n');
    return await message.reply(`Saved Contacts\n\n${contactList}`);
  }
);

Module(
  {
    name: 'vcf',
    fromMe: true,
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
