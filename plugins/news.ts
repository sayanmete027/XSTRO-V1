import { Message } from '../types';
import { Module, XSTRO } from '../src';

Module(
  {
    name: 'news',
    fromMe: false,
    desc: 'Get World News Now',
    type: 'news',
  },
  async (message:Message) => {
    const res = await XSTRO.news();
    let data = '';
    for (const item of res) {
      data += `Title: ${item.title}\n\nDescription: ${item.description}\n\nLink: ${item.url}\n\n`;
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
  async (message) => {
    const res = await XSTRO.footballnews();
    let data = '';
    for (const item of res) {
      data += `Title: ${item.title}\nLink: ${item.url}\n\n`;
    }
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
  async (message) => {
    const res = await XSTRO.animenews();
    let data = '';
    for (const item of res) {
      data += `Title: ${item.title}\nDescription: ${item.description}\nLink: ${item.link}\n\n`;
    }
    return await message.reply(data);
  }
);

Module(
  {
    name: 'technews',
    fromMe: false,
    desc: 'Get Tech latest news',
    type: 'news',
  },
  async (message) => {
    const news = await XSTRO.technews();
    const data = news
      .map(
        (article, index) =>
          `${index + 1}. ${article.title}\n${article.description || ''}\n${article.link}`
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
  async (message) => {
    const res = await XSTRO.wabeta();
    const news = res
      .map(
        (item, index) =>
          `${index + 1}. ${item.title}\n${item.description}\n[Read more](${item.url})\n`
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
  async (message) => {
    const res = await XSTRO.voxnews();
    if (!res) return message.reply('No News');
    const data = res.map(
      (article) => `Title: ${article.title}\nAuthor: ${article.author}\nUrl: ${article.url}\n\n`
    );
    return await message.reply(data.join('\n'));
  }
);
