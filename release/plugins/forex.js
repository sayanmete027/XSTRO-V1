"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const src_1 = require("../src");
(0, src_1.Module)({
  name: 'forex',
  fromMe: false,
  desc: 'Get Forex Data for Pair',
  type: 'forex'
}, async (message, match) => {
  if (!match) return message.send('Give me a symbol, EURUSD');
  const res = await src_1.XSTRO.forex(match);
  if (!res) return message.send('Invaild Forex Pair');
  return message.send(`${match.toUpperCase()}\n\nLastPrice: ${res.lastPrice}\nCurrency: ${res.currency}\nChangeValue: ${res.changeValue}\nLastUpdate: ${res.lastUpdate}`);
});
(0, src_1.Module)({
  name: 'fxmajor',
  fromMe: false,
  desc: 'Get Current Market Details for Forex Majors',
  type: 'forex'
}, async message => {
  const res = await (await fetch(`${src_1.LANG.API}/api/fxmajor`)).json();
  if (!res) return message.send('No data from market available');
  await message.send(res.map(item => {
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
  }).join('\n\n'));
});
(0, src_1.Module)({
  name: 'fxminor',
  fromMe: false,
  desc: 'Get Current Market Details for Forex Minors',
  type: 'forex'
}, async message => {
  const res = await (await fetch(`${src_1.LANG.API}/api/fxminor`)).json();
  if (!res) return message.send('No data from market available');
  const data = res.map(item => {
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
  }).join('\n\n');
  await message.send(data);
});
(0, src_1.Module)({
  name: 'fxexotic',
  fromMe: false,
  desc: 'Get Current Market Details for Forex Exotic',
  type: 'forex'
}, async message => {
  const res = await (await fetch(`${src_1.LANG.API}/api/fxexotic`)).json();
  if (!res) return message.send('No data from market available');
  await message.send(res.map(item => {
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
  }).join('\n\n'));
});
(0, src_1.Module)({
  name: 'fxamericas',
  fromMe: false,
  desc: 'Get Current Market Details for Forex Americas',
  type: 'forex'
}, async message => {
  const res = await (await fetch(`${src_1.LANG.API}/api/fxamericas`)).json();
  if (!res) return message.send('No data from market available');
  const data = res.map(item => {
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
  }).join('\n\n');
  await message.send(data);
});
(0, src_1.Module)({
  name: 'fxeurope',
  fromMe: false,
  desc: 'Get Current Market Details for Forex Europe',
  type: 'forex'
}, async message => {
  const res = await (await fetch(`${src_1.LANG.API}/api/fxeurope`)).json();
  if (!res) return message.send('No data from market available');
  const data = res.map(item => {
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
  }).join('\n\n');
  await message.send(data);
});
(0, src_1.Module)({
  name: 'fxasia',
  fromMe: false,
  desc: 'Get Current Market Details for Forex Asia',
  type: 'forex'
}, async message => {
  const res = await (await fetch(`${src_1.LANG.API}/api/fxasia`)).json();
  if (!res) return message.send('No data from market available');
  const data = res.map(item => {
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
  }).join('\n\n');
  await message.send(data);
});
(0, src_1.Module)({
  name: 'fxpacific',
  fromMe: false,
  desc: 'Get Current Market Details for Forex Pacific',
  type: 'forex'
}, async message => {
  const res = await (await fetch(`${src_1.LANG.API}/api/fxpacific`)).json();
  if (!res) return message.send('No data from market available');
  const data = res.map(item => {
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
  }).join('\n\n');
  await message.send(data);
});
(0, src_1.Module)({
  name: 'fxeast',
  fromMe: false,
  desc: 'Get Current Market Details for Forex Middle East',
  type: 'forex'
}, async message => {
  const res = await (await fetch(`${src_1.LANG.API}/api/fxmiddle-east`)).json();
  if (!res) return message.send('No data from market available');
  const data = res.map(item => {
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
  }).join('\n\n');
  await message.send(data);
});
(0, src_1.Module)({
  name: 'fxafrica',
  fromMe: false,
  desc: 'Get Current Market Details for Forex Africa',
  type: 'forex'
}, async message => {
  const res = await (await fetch(`${src_1.LANG.API}/api/fxafrica`)).json();
  if (!res) return message.send('No data from market available');
  const data = res.map(item => {
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
  }).join('\n\n');
  await message.send(data);
});