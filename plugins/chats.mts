import { MessageType, Module } from "#default";

Module(
    {
        name: "pin",
        fromMe: true,
        desc: "Pin a chat",
        type: "chats",
    },
    async (message: MessageType) => {
        return await message.chatModify({ pin: true }, message.jid);
    }
);

Module(
    {
        name: "unpin",
        fromMe: true,
        desc: "Unpin a chat",
        type: "chats",
    },
    async (message: MessageType) => {
        return await message.chatModify({ pin: false }, message.jid);
    }
);

Module(
    {
        name: "archive",
        fromMe: true,
        desc: "Archive a chat",
        type: "chats",
    },
    async (message: MessageType) => {
        return await message.chatModify({ archive: true, lastMessages: [{ key: message.key, messageTimestamp: message.messageTimestamp }] }, message.jid);
    }
);

Module(
    {
        name: "unarchive",
        fromMe: true,
        desc: "Archive a chat",
        type: "chats",
    },
    async (message: MessageType) => {
        return await message.chatModify({ archive: false, lastMessages: [{ key: message.key, messageTimestamp: message.messageTimestamp }] }, message.jid);
    }
);

Module(
    {
        name: "clear",
        fromMe: true,
        desc: "Clear a chat",
        type: "chats",
    },
    async (message: MessageType) => {
        return await message.chatModify({ clear: true }, message.jid);
    }
);

Module(
    {
        name: "delete",
        fromMe: true,
        desc: "Delete a chat",
        type: "chats",
    },
    async (message: MessageType) => {
        return await message.chatModify({ delete: true, lastMessages: [{ key: message.key, messageTimestamp: message.messageTimestamp }] }, message.jid);
    }
);

Module(
    {
        name: "star",
        fromMe: true,
        desc: "Star a message",
        type: "chats",
    },
    async (message: MessageType) => {
        if (!message.quoted) {
            return message.send("Reply a message to star");
        }
        const { key } = message.quoted;
        if (!key.id) return;
        return await message.chatModify({ star: { messages: [{ id: key.id, fromMe: key.fromMe }], star: true } }, message.jid);
    }
);

Module(
    {
        name: "unstar",
        fromMe: true,
        desc: "Unstar a message",
        type: "chats",
    },
    async (message: MessageType) => {
        if (!message.quoted) {
            return message.send("Reply a message to star");
        }
        const { key } = message.quoted;
        if (!key.id) return;
        return await message.chatModify({ star: { messages: [{ id: key.id, fromMe: key.fromMe }], star: false } }, message.jid);
    }
);