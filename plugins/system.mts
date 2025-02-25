import { Module, MessageType, runtime } from "#default";

Module(
    {
        name: "ping",
        fromMe: false,
        desc: "Get Performance",
        type: "system",
    },
    async (message: MessageType) => {
        const start = Date.now();
        const msg = await message.send("Pong!");
        const end = Date.now();
        await msg.edit(`\`\`\`Pong\n${end - start} ms\`\`\``);
    }
);

Module(
    {
        name: "runtime",
        fromMe: false,
        desc: "Get System uptime",
        type: "system",
    },
    async (message: MessageType) => {
        return await message.send(runtime(process.uptime()));
    }
);
