import { Module, getContacts, getName, groupMetadata } from '#src';

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
    const contactList = contacts.map((c) => `${c.name}: ${c.jid.split('@')[0]}`).join('\n');
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
  async (message, _, { sendMessage: send }) => {
    const { subject, participants } = await groupMetadata(message.from);
    const contacts = await Promise.all(
      participants.map(async ({ id }, index) => {
        const name = (await getName(id)) || `${subject} ${index + 1}`;
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;TYPE=CELL:${id.replace(/@.+/, '')}\nEND:VCARD`;
      })
    );
    const vcard = Buffer.from(contacts.join('\n'), 'utf-8');
    await send(message.from, {
      document: vcard,
      mimetype: 'text/vcard',
      fileName: `${subject}_contacts.vcf`,
    });
  }
);
