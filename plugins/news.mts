import { MessageType, Module, voxnews } from "#default";

Module(
    {
        name: "news",
        fromMe: false,
        desc: "Get News from Vox",
        type: "news",
    },
    async (message: MessageType) => {
        const news = await voxnews();
        if (!news) return message.send("No news avaliable");
        return await message.send(news);
    }
);
