import { editConfig, getConfig, MessageType, Module } from "#default";

Module(
    {
        name: "antilink",
        fromMe: false,
        isGroup: true,
        desc: "Manages Group and prevents non_admins from sending links",
        type: "group",
    },
    async (message: MessageType, match: string) => {
        if (!match || (!match.toLowerCase().includes("on") && !match.toLowerCase().includes("off"))) {
            return message.send(`Usage: ${message.prefix}antilink on | off`);
        }
        const status = (await getConfig()).antilink;
        if (match === "on") {
            if (status.includes({ jid: message.jid, status: true })) return message.send("Antilink already turned on.");
            await editConfig({ antilink: [{ jid: message.jid, status: true }] });
            return message.send("Antilink enabled for this group");
        }
        if (match === "off") {
            if (status.includes({ jid: message.jid, status: false })) return message.send("Antilink already turned off.");
            await editConfig({ antilink: [{ jid: message.jid, status: false }] });
            return message.send("Antilink disabled for this group");
        }
    }
);
