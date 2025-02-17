import { Module, Xprocess, runtime, Message } from '../src/index.mjs';
import { resolve } from 'path';
import { arch, cpus, platform } from 'os';
import { existsSync, readFileSync } from 'fs';

Module(
  {
    name: 'ping',
    fromMe: false,
    desc: 'Get Performance',
    type: 'system',
  },
  async (message: Message) => {
    const start = Date.now();
    const msg = await message.send('Pong!');
    const end = Date.now();
    await msg.edit(`\`\`\`Pong\n${end - start} ms\`\`\``);
  }
);

Module(
  {
    name: 'file',
    fromMe: false,
    desc: 'Send the content of a specified file',
    type: 'system',
  },
  async (message: Message, match: string) => {
    if (!match) return await message.reply('Provide a filename. Eg config');
    const filePath = resolve(process.cwd(), match.trim());
    if (!existsSync(filePath)) return message.reply(`File not in that DIR`);
    const fileContent = readFileSync(filePath, 'utf-8');
    message.send(fileContent.toString());
  }
);

Module(
  {
    name: 'runtime',
    fromMe: false,
    desc: 'Get Runtime of Module',
    type: 'system',
  },
  async (message: Message) => {
    await message.reply(`\`\`\`${runtime(process.uptime())}\`\`\``);
  }
);

Module(
  {
    name: 'restart',
    fromMe: false,
    desc: 'Restarts Bot',
    type: 'system',
  },
  async (message: Message) => {
    await message.reply('Restarting');
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
  async () => {
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
  async (message: Message) => {
    await message.client.logout()
  }
);

Module(
  {
    name: 'cpu',
    fromMe: false,
    desc: 'Get CPU Info',
    type: 'system',
  },
  async (message: Message) => {
    const cpu = cpus()[0];
    const totalCores = cpus().length;
    const clockSpeed = (cpu.speed / 1000).toFixed(2);

    const info = `System Information

CPU Model: ${cpu.model}
Architecture: ${arch()}
Cores: ${totalCores}
Clock Speed: ${clockSpeed} GHz
Operating System: ${platform()}
Times:
  - User: ${(cpu.times.user / 1000).toFixed(2)}s
  - System: ${(cpu.times.sys / 1000).toFixed(2)}s
  - Idle: ${(cpu.times.idle / 1000).toFixed(2)}s`;

    await message.send(info.trim());
  }
);
