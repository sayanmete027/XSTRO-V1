import config from '#config';
import { bot, commands, formatBytes, getRandom, runtime, font } from '#src';
import { platform, totalmem, freemem } from 'os';

bot(
  {
    pattern: 'menu',
    public: true,
    desc: 'Show All Commands',
    dontAddCommandList: true,
  },
  async (message, _, { mode, prefix }) => {
    const cmds = commands.filter(
      (cmd) =>
        cmd.pattern && !cmd.dontAddCommandList && !cmd.pattern.toString().includes('undefined')
    ).length;
    let menuInfo = `\`\`\`
╭─── ${config.BOT_INFO.split(';')[1]} ────
│ Prefix: ${getRandom(prefix)}
│ Owner: ${config.BOT_INFO.split(';')[0]}		
│ Plugins: ${cmds}
│ Mode: ${mode ? 'Private' : 'Public'}
│ Uptime: ${runtime(process.uptime())}
│ Platform: ${platform()}
│ Ram: ${formatBytes(totalmem() - freemem())}
│ Day: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
│ Date: ${new Date().toLocaleDateString('en-US')}
│ Time: ${new Date().toLocaleTimeString('en-US', { timeZone: config.TIME_ZONE })}
│ Version: ${config.VERSION}
╰─────────────\`\`\`\n`;

    const commandsByType = commands
      .filter((cmd) => cmd.pattern && !cmd.dontAddCommandList)
      .reduce((acc, cmd) => {
        const type = cmd.type || 'Misc';
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(cmd.pattern.toString().toLowerCase().split(/\W+/)[2]);
        return acc;
      }, {});

    const sortedTypes = Object.keys(commandsByType).sort();

    let totalCommands = 1;

    sortedTypes.forEach((type) => {
      const sortedCommands = commandsByType[type].sort();
      menuInfo += font.tiny(`╭──── *${type}* ────\n`);
      sortedCommands.forEach((cmd) => {
        menuInfo += font.tiny(`│${totalCommands}· ${cmd}\n`);
        totalCommands++;
      });
      menuInfo += font.tiny(`╰────────────\n`);
    });
    return await message.send(menuInfo.trim());
  }
);

bot(
  {
    pattern: 'list',
    public: true,
    desc: 'Show All Commands',
    dontAddCommandList: true,
  },
  async (message) => {
    let cmdsList = 'Command List\n\n';
    let cmdList = [];
    let cmd, desc;
    commands.map((command) => {
      if (command.pattern) cmd = command.pattern.toString().split(/\W+/)[2];
      desc = command.desc || false;
      if (!command.dontAddCommandList && cmd !== undefined) cmdList.push({ cmd, desc });
    });
    cmdList.sort((a, b) => a.cmd.localeCompare(b.cmd));
    cmdList.forEach(({ cmd, desc }, num) => {
      cmdsList += `${(num += 1)} ${cmd}\n`;
      if (desc) cmdsList += `${desc}\n\n`;
    });

    return await message.reply(cmdsList);
  }
);
