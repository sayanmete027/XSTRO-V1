import { isJidUser, WASocket } from "baileys/lib/index.js";
import { Module, Message } from "#default";

Module(
    {
        name: "vv",
        fromMe: false,
        desc: "forward a viewonce message",
        type: "whatsapp",
    },
    async (msg: Message) => {
        /** Ensure the quoted message exists and is a view-once message */
        if (!msg.quoted || !msg.quoted.viewonce) {
            return msg.reply("Reply viewonce");
        }
        /** Modify the message to remove view-once restriction */
        msg.quoted.message![msg.quoted.type!].viewOnce = false;
        /** Forward the modified message to the owner */
        await msg.forward(msg.owner, msg?.quoted, { quoted: msg.quoted });
        return msg.reply("done");
    }
);

Module(
    {
        name: "waname",
        fromMe: true,
        desc: "Updates your WA name",
        type: "whatsapp",
    },
    async (msg: Message, match: string) => {
        /** Ensure a new name is provided */
        if (!match) return msg.reply("provide new name");
        /** Update the user's profile name */
        await msg.client.updateProfileName(match);
        return msg.reply("done");
    }
);

Module(
    {
        name: "tovv",
        fromMe: false,
        desc: "Converts media message to viewonce message",
        type: "whatsapp",
    },
    async (msg: Message) => {
        /** Ensure a quoted message exists and is of type Image, Video, or Audio */
        if (!msg.quoted! || (msg.quoted?.audio && msg.quoted?.video && msg.quoted?.image)) {
            return msg.send("Reply an Image, Video or Audio message");
        }
        /** Modify the message to enable view-once mode */
        msg.quoted.message![msg.quoted.type!].viewOnce = true;
        /** Forward the modified message to the owner */
        await msg.forward(msg.owner, msg?.quoted, { quoted: msg.quoted });
    }
);

Module(
    {
        name: "block",
        fromMe: true,
        desc: "Block someone",
        type: "whatsapp",
    },
    async (message: Message, match: string, client: WASocket) => {
        /** Auto get the Jid */
        const jid = await message.user(match);
        /** The jid must be valid */
        if (!jid || isJidUser(jid)) {
            return message.reply("Provide a user to block");
        }
        /** Notify about the block action */
        await message.send(`@${jid.split("@")[0]} has been blocked`, { mentions: [jid] });
        /** Block the user */
        await client.updateBlockStatus(jid, "block");
        return;
    }
);

Module(
    {
        name: "unblock",
        fromMe: true,
        desc: "Unblock someone",
        type: "whatsapp",
    },
    async (message: Message, match: string, client: WASocket) => {
        /** Auto get the Jid */
        const jid = await message.user(match);
        /** The jid must be valid */
        if (!jid || isJidUser(jid)) {
            return message.reply("Provide a user to Unblock");
        }
        /** Notify about the unblock action */
        await message.send(`@${jid.split("@")[0]} has been Unblocked`, { mentions: [jid] });
        /** Unblock the user */
        await client.updateBlockStatus(jid, "unblock");
        return;
    }
);

Module(
    {
        name: "blocklist",
        fromMe: true,
        desc: "Shows all your blocked numbers",
        type: "whatsapp",
    },
    async (message: Message, match: string, client: WASocket) => {
        /** Get all the blocked Numbers in an array */
        const blocklist_data = await client.fetchBlocklist();
        /** Calculate the number of blocked people */
        const total_blocked_count = blocklist_data.length;
        /** If the blocklist is empty, notify the user */
        if (total_blocked_count < 1) {
            return message.reply("Empty blocklist");
        }
        /** Organize and format the blocked numbers */
        const data = blocklist_data.map((numbers) => `@${numbers.split("@")[0]}`).join("\n");
        return message.send(data, { mentions: blocklist_data });
    }
);
