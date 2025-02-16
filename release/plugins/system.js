"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const src_1 = require("../src");
const path_1 = require("path");
const os_1 = require("os");
const fs_1 = require("fs");
(0, src_1.Module)({
  name: 'ping',
  fromMe: false,
  desc: 'Get Performance',
  type: 'system'
}, async message => {
  const start = Date.now();
  const msg = await message.send('Pong!');
  const end = Date.now();
  await msg.edit(`\`\`\`Pong\n${end - start} ms\`\`\``);
});
(0, src_1.Module)({
  name: 'file',
  fromMe: false,
  desc: 'Send the content of a specified file',
  type: 'system'
}, async (message, match) => {
  if (!match) return await message.reply('Provide a filename. Eg config');
  const filePath = (0, path_1.resolve)(process.cwd(), match.trim());
  if (!(0, fs_1.existsSync)(filePath)) return message.reply(`File not in that DIR`);
  const fileContent = (0, fs_1.readFileSync)(filePath, 'utf-8');
  message.send(fileContent.toString());
});
(0, src_1.Module)({
  name: 'runtime',
  fromMe: false,
  desc: 'Get Runtime of Module',
  type: 'system'
}, async message => {
  await message.reply(`\`\`\`${(0, src_1.runtime)(process.uptime())}\`\`\``);
});
(0, src_1.Module)({
  name: 'restart',
  fromMe: false,
  desc: 'Restarts Bot',
  type: 'system'
}, async message => {
  await message.reply('Restarting');
  (0, src_1.Xprocess)('restart');
});
(0, src_1.Module)({
  name: 'shutdown',
  fromMe: false,
  desc: 'Off Bot',
  type: 'system'
}, async () => {
  (0, src_1.Xprocess)('stop');
});
(0, src_1.Module)({
  name: 'logout',
  fromMe: false,
  desc: 'End your Xstro Session',
  type: 'system'
}, async message => {
  await message.client.logout();
});
(0, src_1.Module)({
  name: 'cpu',
  fromMe: false,
  desc: 'Get CPU Info',
  type: 'system'
}, async message => {
  const cpu = (0, os_1.cpus)()[0];
  const totalCores = (0, os_1.cpus)().length;
  const clockSpeed = (cpu.speed / 1000).toFixed(2);
  const info = `System Information

CPU Model: ${cpu.model}
Architecture: ${(0, os_1.arch)()}
Cores: ${totalCores}
Clock Speed: ${clockSpeed} GHz
Operating System: ${(0, os_1.platform)()}
Times:
  - User: ${(cpu.times.user / 1000).toFixed(2)}s
  - System: ${(cpu.times.sys / 1000).toFixed(2)}s
  - Idle: ${(cpu.times.idle / 1000).toFixed(2)}s`;
  await message.send(info.trim());
});