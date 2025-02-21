<<<<<<< HEAD
import { Module, XSTRO, Message } from "#default";
=======
import { Module, XSTRO, Message } from '../src/index.mjs';
>>>>>>> parent of 10ae71d (test)

Module(
    {
        name: 'news',
        fromMe: false,
        desc: 'Get World News Now',
        type: 'news',
    },
    async (message: Message) => {
        const res = await XSTRO.news();
        let data = '';
        if (res) {
            for (const item of res) {
                data += `Title: ${item.title}\n\nDescription: ${item.description}\n\nLink: ${item.url}\n\n`;
            }
        }
        return await message.reply(data);
    }
);

Module(
    {
        name: 'footballnews',
        fromMe: false,
        desc: 'Get Latest Football News',
        type: 'news',
    },
    async (message: Message) => {
        const res = await XSTRO.footballnews();
        if (!res || !Array.isArray(res)) {
            return await message.reply('Failed to fetch football news.');
        }

        let data = res.map(item => `Title: ${item.title}\nLink: ${item.url}\n\n`).join('');
        return await message.reply(data);
    }
);

Module(
    {
        name: 'animenews',
        fromMe: false,
        desc: "Get's Latest Anime News",
        type: 'news',
    },
    async (message: Message) => {
        const res = await XSTRO.animenews();
        if (!res || !Array.isArray(res)) {
            return message.reply("Failed to fetch anime news.");
        }
        let data = res
            .map(
                (item) =>
                    `Title: ${item.title}\nDescription: ${item.description || "No description available."}\nLink: ${item.link}\n`
            )
            .join("\n");

        return message.reply(data);
    }
);

Module(
    {
        name: 'technews',
        fromMe: false,
        desc: 'Get Tech latest news',
        type: 'news',
    },
    async (message: Message) => {
        const news = await XSTRO.technews();
        if (!news || !Array.isArray(news)) {
            return message.reply('Failed to fetch tech news.');
        }
        const data = news
            .map(
                (article, index) =>
                    `${index + 1}. ${article.title}\n${article.description || 'No description available.'}\n${article.link}`
            )
            .join('\n\n');

        return message.reply(data);
    }
);

Module(
    {
        name: 'wabeta',
        fromMe: false,
        desc: 'WhatsApp Beta Info News',
        type: 'news',
    },
    async (message: Message) => {
        const res = await XSTRO.wabeta();
        if (!res || !Array.isArray(res)) {
            return message.reply('Failed to fetch WhatsApp Beta news.');
        }

        const news = res
            .map(
                (item: any, index) =>
                    `${index + 1}. ${item.title}\n${item.description || 'No description available.'}\n[Read more](${item.url})\n`
            )
            .join('\n');

        return message.reply(news);
    }
);

Module(
    {
        name: 'voxnews',
        fromMe: false,
        desc: 'VoxNews',
        type: 'news',
    },
    async (message: Message) => {
        const res = await XSTRO.voxnews();
        if (!res) return message.reply('No News');
        const data = res.map(
            (article) => `Title: ${article.title}\nAuthor: ${article.author}\nUrl: ${article.url}\n\n`
        );
        return await message.reply(data.join('\n'));
    }
);
