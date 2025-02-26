import { MessageType, Module, voxnews, wabetanews } from "#core";

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

Module(
    {
        name: "wabeta",
        fromMe: false,
        desc: "Get WABeta News",
        type: "news",
    },
    async (message: MessageType) => {
        const wabetaInfo = await wabetanews();
        if (!wabetaInfo) return message.send("No WA updates avaliable");
        return await message.send(wabetaInfo);
    }
);
