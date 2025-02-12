import { Module, Xprocess, runtime } from '#src';
import { resolve } from 'path';
import { arch, cpus, platform, uptime } from 'os';
import { existsSync, readFileSync } from 'fs';

Module(
  {
    name: 'ping',
    fromMe: false,
    desc: 'Get Performance',
    type: 'system',
  },
  async (message) => {
    const start = Date.now();
    const msg = await message.send('Pong!');
    const end = Date.now();
    await msg.edit(`\`\`\`Pong! ${end - start} ms\`\`\``);
  }
);

Module(
  {
    name: 'file',
    fromMe: false,
    desc: 'Send the content of a specified file',
    type: 'system',
  },
  async (message, match) => {
    if (!match) return message.reply('Give me Module file. Eg config.js');
    const filePath = resolve(process.cwd(), match.trim());
    if (!existsSync(filePath)) return message.reply(`File not in that DIR`);
    const fileContent = readFileSync(filePath, 'utf-8');
    return message.send(fileContent.toString());
  }
);

Module(
  {
    name: 'runtime',
    fromMe: false,
    desc: 'Get Runtime of Module',
    type: 'system',
  },
  async (message) => {
    return await message.reply(`Uptime: ${runtime(process.uptime())}`);
  }
);

Module(
  {
    name: 'restart',
    fromMe: false,
    desc: 'Restarts Bot',
    type: 'system',
  },
  async (message) => {
    await message.send('*Restarting...*');
    Xprocess('restart');
  }
);

Module(
  {
    name: 'shutdown',
    fromMe: false,
    desc: 'Off Bot',
    type: 'system',
  },
  async (message) => {
    await message.send('*Going Offline...*');
    Xprocess('stop');
  }
);

Module(
  {
    name: 'logout',
    fromMe: false,
    desc: 'End your Xstro Session',
    type: 'system',
  },
  async (message, _, { pushName }) => {
    await message.reply(`Goodbye ${pushName}`);
    await message.client.logout();
  }
);

Module(
  {
    name: 'cpu',
    fromMe: false,
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
