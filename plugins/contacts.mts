import { Module, getContacts, getName, groupMetadata, Message } from "../src/index.mjs";

Module(
    {
        name: "contacts",
        fromMe: true,
        desc: "Get all contacts saved by Module",
        type: "contacts",
    },
    async (message: Message) => {
        const contacts = await getContacts();
        if (!contacts.length) return await message.send("No contacts saved yet");
        const contactList = contacts.map((c) => `${c.name}: ${c.jid.split("@")[0]}`).join("\n");
        return await message.reply(`Saved Contacts\n\n${contactList}`);
    }
);

Module(
    {
        name: "vcf",
        fromMe: true,
        isGroup: true,
        desc: "Get All Group Members Contacts",
        type: "contacts",
    },
    async (message: Message) => {
        const metadata = await groupMetadata(message.jid);
        const contacts = await Promise.all(
            metadata?.participants?.map(async ({ id }, index) => {
                const name = (await getName(id)) || `${metadata?.subject!} ${index + 1}`;
                return `BEGIN:VCARD\nVERSION:3.0\nFN:${name!}\nTEL;TYPE=CELL:${id.replace(/@.+/, "")}\nEND:VCARD`;
            }) || []
        );
        const vcard = Buffer.from(contacts.join("\n"), "utf-8");
        await message.client.sendMessage(message.jid, {
            document: vcard,
            mimetype: "text/vcard",
            fileName: `${metadata?.subject}_contacts.vcf`,
        });
    }
);
