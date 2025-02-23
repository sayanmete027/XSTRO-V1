import { MessageType, Module, numToJid } from "#default";

Module(
    {
        name: "newgc",
        fromMe: true,
        isGroup: false,
        desc: "Add a user to a Group",
        type: "group",
    },
    async (message: MessageType, match: string) => {
        if (!match) {
            return message.send(`Usage: ${message.prefix}newgc MyGroup|1244556`);
        }
        const [groupName, numbers] = match.split("|");

        if (!groupName || !numbers) {
            return message.send("Usage: GroupName|Number1,Number2");
        }
        const participants = numbers.split(",").map((num) => numToJid(num.trim()));
        await message.groupCreate(groupName.trim(), message.mentions && message.mentions.length > 0 ? message.mentions : participants);
    }
);

Module(
    {
        name: "kick",
        fromMe: false,
        isGroup: true,
        desc: "Remove a participant from Group",
        type: "group",
    },
    async (message: MessageType, match: string) => {
        if (!(await message.isAdmin())) {
            return message.send("You are not Admin.");
        }
        if (!(await message.isBotAdmin())) {
            return message.send("I am not an Admin.");
        }
        if(!match) { 
            return message.send("Provide a participant to kick.");
        }
        const user = message.user(match);
        if (!user) {
            return message.send("Provide a participant to kick.");
        }
        await message.groupParticipantsUpdate(message.jid, [user], "remove");
    }
);
