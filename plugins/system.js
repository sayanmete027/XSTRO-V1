import { bot } from '#src';
import { performance } from 'perf_hooks';
import { resolve } from 'path';
import { arch, cpus, platform, uptime } from 'os';
import { existsSync, readFileSync } from 'fs';
import { Xprocess, runtime } from '#utils';

bot(
  {
    pattern: 'ping',
    public: true,
    desc: 'Get Performance',
    type: 'system',
  },
  async (message) => {
    const start = performance.now();
    const msg = await message.send('Pong!');
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
    if (!match) return message.reply('Give me bot file. Eg config.js');
    const filePath = resolve(process.cwd(), match.trim());
    if (!existsSync(filePath)) return message.reply(`File not in that DIR`);
    const fileContent = readFileSync(filePath, 'utf-8');
    return message.send(fileContent.toString());
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
    return await message.reply(`Uptime: ${runtime(process.uptime())}`);
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
    await message.send('*Restarting...*');
    Xprocess('restart');
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
    await message.send('*Going Offline...*');
    Xprocess('stop');
  }
);

bot(
  {
    pattern: 'logout',
    public: false,
    desc: 'End your Xstro Session',
    type: 'system',
  },
  async (message, _, { pushName }) => {
    await message.reply(`Goodbye ${pushName}`);
    await message.client.logout();
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
    const cpu = cpus();
    const coreCount = cpu.length;
    const model = cpu[0].model
      .replace(/\s+\(.*\)/g, '')
      .replace(/CPU|Processor/gi, '')
      .trim();

    const averageSpeed = Math.round(cpu.reduce((sum, cpu) => sum + cpu.speed, 0) / coreCount);

    const response = `CPU Information:
Model: ${model}
Cores: ${coreCount}
Average Speed: ${averageSpeed} MHz
Architecture: ${arch()}
Platform: ${platform()}
Uptime: ${Math.floor(uptime() / 60)} minutes`;

    await message.send('' + response + '');
  }
);
