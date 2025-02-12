import { bot, XSTRO } from '#src';

bot(
  {
    pattern: 'news',
    public: true,
    desc: 'Get World News Now',
    type: 'news',
  },
  async (message) => {
    const res = await XSTRO.news();
    let data = '';
    for (const item of res) {
      data += `Title: ${item.title}\n\nDescription: ${item.description}\n\nLink: ${item.url}\n\n`;
    }
    return await message.reply(data);
  }
);

bot(
  {
    pattern: 'footballnews',
    public: true,
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

bot(
  {
    pattern: 'animenews',
    public: true,
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

bot(
  {
    pattern: 'technews',
    public: true,
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

bot(
  {
    pattern: 'wabeta',
    public: true,
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

bot(
  {
    pattern: 'voxnews',
    public: true,
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
