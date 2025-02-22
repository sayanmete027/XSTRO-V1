import { Module, Message } from "#default";

Module(
    {
        name: "ping",
        fromMe: false,
        desc: "Get Performance",
        type: "system",
    },
    async (message: any) => {
        const start = Date.now();
        const msg = await message.send("Pong!");
        const end = Date.now();
        await msg.edit(`\`\`\`Pong\n${end - start} ms\`\`\``);
    }
);
