import { bot, XSTRO, LANG } from '#src';

bot(
  {
    pattern: 'forex',
    public: true,
    desc: 'Get Forex Data for Pair',
    type: 'forex',
  },
  async (message, match) => {
    if (!match) return message.send('Give me a symbol, EURUSD');
    const res = await XSTRO.forex(match);
    if (!res) return message.send('Invaild Forex Pair');
    return message.send(
      `${match}\n\nLastPrice: ${res.lastPrice}\nCurrency: ${res.currency}\nChangeValue: ${res.changeValue}\nLastUpdate: ${res.lastUpdate}`
    );
  }
);

bot(
  {
    pattern: 'fxmajor',
    public: true,
    desc: 'Get Current Market Details for Forex Majors',
    type: 'forex',
  },
  async (message) => {
    const res = await (await fetch(`${LANG.API}/api/fxmajor`)).json();
    if (!res) return message.send('No data from market available');
    await message.send(
      res
        .map((item) => {
          return `
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
`.trim();
        })
        .join('\n\n')
    );
  }
);

bot(
  {
    pattern: 'fxminor',
    public: true,
    desc: 'Get Current Market Details for Forex Minors',
    type: 'forex',
  },
  async (message) => {
    const res = await (await fetch(`${LANG.API}/api/fxminor`)).json();
    if (!res) return message.send('No data from market available');
    const data = res
      .map((item) => {
        return `
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
`.trim();
      })
      .join('\n\n');
    await message.send(data);
  }
);

bot(
  {
    pattern: 'fxexotic',
    public: true,
    desc: 'Get Current Market Details for Forex Exotic',
    type: 'forex',
  },
  async (message) => {
    const res = await (await fetch(`${LANG.API}/api/fxexotic`)).json();
    if (!res) return message.send('No data from market available');
    await message.send(
      res
        .map((item) => {
          return `
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
`.trim();
        })
        .join('\n\n')
    );
  }
);

bot(
  {
    pattern: 'fxamericas',
    public: true,
    desc: 'Get Current Market Details for Forex Americas',
    type: 'forex',
  },
  async (message) => {
    const res = await (await fetch(`${LANG.API}/api/fxamericas`)).json();
    if (!res) return message.send('No data from market available');
    const data = res
      .map((item) => {
        return `
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
`.trim();
      })
      .join('\n\n');
    await message.send(data);
  }
);

bot(
  {
    pattern: 'fxeurope',
    public: true,
    desc: 'Get Current Market Details for Forex Europe',
    type: 'forex',
  },
  async (message) => {
    const res = await (await fetch(`${LANG.API}/api/fxeurope`)).json();
    if (!res) return message.send('No data from market available');
    const data = res
      .map((item) => {
        return `
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
`.trim();
      })
      .join('\n\n');
    await message.send(data);
  }
);

bot(
  {
    pattern: 'fxasia',
    public: true,
    desc: 'Get Current Market Details for Forex Asia',
    type: 'forex',
  },
  async (message) => {
    const res = await (await fetch(`${LANG.API}/api/fxasia`)).json();
    if (!res) return message.send('No data from market available');
    const data = res
      .map((item) => {
        return `
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
`.trim();
      })
      .join('\n\n');
    await message.send(data);
  }
);

bot(
  {
    pattern: 'fxpacific',
    public: true,
    desc: 'Get Current Market Details for Forex Pacific',
    type: 'forex',
  },
  async (message) => {
    const res = await (await fetch(`${LANG.API}/api/fxpacific`)).json();
    if (!res) return message.send('No data from market available');
    const data = res
      .map((item) => {
        return `
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
`.trim();
      })
      .join('\n\n');
    await message.send(data);
  }
);

bot(
  {
    pattern: 'fxeast',
    public: true,
    desc: 'Get Current Market Details for Forex Middle East',
    type: 'forex',
  },
  async (message) => {
    const res = await (await fetch(`${LANG.API}/api/fxmiddle-east`)).json();
    if (!res) return message.send('No data from market available');
    const data = res
      .map((item) => {
        return `
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
`.trim();
      })
      .join('\n\n');
    await message.send(data);
  }
);

bot(
  {
    pattern: 'fxafrica',
    public: true,
    desc: 'Get Current Market Details for Forex Africa',
    type: 'forex',
  },
  async (message) => {
    const res = await (await fetch(`${LANG.API}/api/fxafrica`)).json();
    if (!res) return message.send('No data from market available');
    const data = res
      .map((item) => {
        return `
Symbol: ${item.Symbol}
Pair: ${item.Pair}
Price: ${item.Price}
Change: ${item.Change} (${item['Change %']})
Bid: ${item.Bid}
Ask: ${item.Ask}
High: ${item.High}
Low: ${item.Low}
Rating: ${item.Rating}
`.trim();
      })
      .join('\n\n');
    await message.send(data);
  }
);
