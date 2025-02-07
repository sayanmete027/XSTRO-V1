import { performance } from 'perf_hooks';
import { bot } from '#src';
import { getDirectoryStructure, manageProcess, runtime } from '#utils';
import { getBuffer, getJson } from 'xstro-utils';
import os from 'os';
import fs from 'fs';
import path from 'path';

bot(
  {
    pattern: 'ping',
    public: true,
    desc: 'Get Performance',
    type: 'system',
  },
  async (message) => {
    const start = performance.now();
    const msg = await message.reply('Testing Speed...');
    const end = performance.now();
    await msg.edit(`\`\`\`Pong! ${(end - start).toFixed(1)} ms\`\`\``);
  }
);

bot(
  {
    pattern: 'file',
    fromMe: true,
    desc: 'Send the content of a specified file',
    type: 'system',
  },
  async (message, match) => {
    const fileName = match?.trim();
    if (!fileName) return message.send('_Please specify the file name. Example: file `config.js`_');
    const filePath = path.resolve(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) {
      return message.send(`_The file "${fileName}" does not exist._`);
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return message.send(`*Content of the file "${fileName}":*\n\n${fileContent}`);
  }
);

bot(
  {
    pattern: 'runtime',
    public: true,
    desc: 'Get Runtime of bot',
    type: 'system',
  },
  async (message) => {
    return await message.send(`Uptime: ${runtime(process.uptime())}`);
  }
);

bot(
  {
    pattern: 'restart',
    public: false,
    desc: 'Restarts Bot',
    type: 'system',
  },
  async (message) => {
    await message.send('Restarting bot');
    manageProcess('restart');
  }
);

bot(
  {
    pattern: 'shutdown',
    public: false,
    desc: 'Off Bot',
    type: 'system',
  },
  async (message) => {
    await message.send('Shutting down bot');
    manageProcess('stop');
  }
);

bot(
  {
    pattern: 'logout',
    public: false,
    desc: 'End your Xstro Session',
    type: 'system',
  },
  async (message) => {
    await message.send('_logging out_');
    await message.client.logout();
  }
);

bot(
  {
    pattern: 'fetch',
    public: true,
    desc: 'Get data from internet',
    type: 'system',
  },
  async (message, match) => {
    if (!match) return message.send('_I need a URL_');
    const [mode, url] = match.split(';');
    if (!url) return message.send('_Use: mode;url_');
    const data = mode === 'json' ? JSON.stringify(await getJson(url)) : await getBuffer(url);
    return await message.send(data, mode === 'json' ? { type: 'text' } : undefined);
  }
);

bot(
  {
    pattern: 'cpu',
    public: false,
    desc: 'Get CPU Information',
    type: 'system',
  },
  async (message) => {
    const cpus = os.cpus();
    const coreCount = cpus.length;
    const model = cpus[0].model
      .replace(/\s+\(.*\)/g, '')
      .replace(/CPU|Processor/gi, '')
      .trim();

    const averageSpeed = Math.round(cpus.reduce((sum, cpu) => sum + cpu.speed, 0) / coreCount);

    const response = `CPU Information:
Model: ${model}
Cores: ${coreCount}
Average Speed: ${averageSpeed} MHz
Architecture: ${os.arch()}
Platform: ${os.platform()}
Uptime: ${Math.floor(os.uptime() / 60)} minutes`;

    await message.send('' + response + '');
  }
);

bot(
  {
    pattern: 'eval',
    public: false,
    desc: 'Evaluate code',
    type: 'system',
  },
  async (
    message,
    match,
    { jid, prefix, relayMessage, sendMessage, loadMessage, getName, quoted }
  ) => {
    const code = match || message.reply_message?.text;
    if (!code) return message.send('_Provide code to evaluate_');
    try {
      const result = await eval(`(async () => { ${code} })()`);
      return await sendMessage(jid, {
        text: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
      });
    } catch (error) {
      const errorMessage = error.stack || error.message || String(error);
      await message.send(`*Error:*\n\n${errorMessage}`);
    }
  }
);

bot(
  {
    pattern: 'structure',
    public: true,
    desc: 'Get the directory structure of the bot',
    type: 'system',
  },
  async (message) => {
    const projectRoot = process.cwd();
    const structureText = `
AstroX11/Xstro:
${getDirectoryStructure(projectRoot)}`.trim();
    return await message.send(`${structureText}`);
  }
);
