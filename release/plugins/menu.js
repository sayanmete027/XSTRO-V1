"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
const config_1 = __importDefault(require("../config"));
const src_1 = require("../src");
const os_1 = require("os");
(0, src_1.Module)({
  name: 'menu',
  fromMe: false,
  desc: 'Show All Commands',
  type: undefined,
  dontAddCommandList: true
}, async message => {
  const cmds = src_1.commands.filter(cmd => cmd.name && !cmd.dontAddCommandList && !cmd.name.toString().includes('undefined')).length;
  let menuInfo = `\`\`\`
╭─── ${config_1.default.BOT_INFO.split(';')[1]} ────
│ Prefix: ${(0, src_1.getRandom)(message.prefix)}
│ Owner: ${config_1.default.BOT_INFO.split(';')[0]}		
│ Plugins: ${cmds}
│ Mode: ${message.mod ? 'Private' : 'Public'}
│ Uptime: ${(0, src_1.runtime)(process.uptime())}
│ Platform: ${(0, os_1.platform)()}
│ Ram: ${(0, src_1.formatBytes)((0, os_1.totalmem)() - (0, os_1.freemem)())}
│ Day: ${new Date().toLocaleDateString('en-US', {
    weekday: 'long'
  })}
│ Date: ${new Date().toLocaleDateString('en-US')}
│ Time: ${new Date().toLocaleTimeString('en-US', {
    timeZone: config_1.default.TIME_ZONE
  })}
│ Version: ${config_1.default.VERSION}
╰─────────────\`\`\`\n`;
  const commandsByType = src_1.commands.filter(cmd => cmd.name && !cmd.dontAddCommandList).reduce((acc, cmd) => {
    const type = cmd.type || 'Misc';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(cmd.name.toString().toLowerCase().split(/\W+/)[2]);
    return acc;
  }, {});
  const sortedTypes = Object.keys(commandsByType).sort();
  let totalCommands = 1;
  sortedTypes.forEach(type => {
    const sortedCommands = commandsByType[type].sort();
    menuInfo += src_1.font.tiny(`╭──── *${type}* ────\n`);
    sortedCommands.forEach(cmd => {
      menuInfo += src_1.font.tiny(`│${totalCommands}· ${cmd}\n`);
      totalCommands++;
    });
    menuInfo += src_1.font.tiny(`╰────────────\n`);
  });
  return await message.send(menuInfo.trim());
});
(0, src_1.Module)({
  name: 'list',
  fromMe: false,
  desc: 'Show All Commands',
  type: undefined,
  dontAddCommandList: true
}, async message => {
  let cmdsList = 'Command List\n\n';
  let cmdList = [];
  let cmd;
  let desc;
  src_1.commands.map(command => {
    if (command.name) {
      const parts = command.name.toString().split(/\W+/);
      cmd = parts.length > 2 ? parts[2] : undefined;
    }
    desc = command?.desc;
    if (!command.dontAddCommandList && cmd !== undefined) cmdList.push({
      cmd,
      desc
    });
  });
  cmdList.sort((a, b) => a.cmd.localeCompare(b.cmd));
  cmdList.forEach(({
    cmd,
    desc
  }, num) => {
    cmdsList += `${num + 1} ${cmd}\n`;
    if (desc) cmdsList += `${desc}\n\n`;
  });
  return await message.reply(cmdsList);
});