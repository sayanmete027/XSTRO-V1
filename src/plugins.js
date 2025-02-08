import { LANG } from '#extension';
import { getConfig } from '#sql';

const commands = [];

const bot = function (cmd, func) {
  cmd.function = func;
  cmd.pattern = new RegExp(`^\\s*(${cmd.pattern})(?:\\s+([\\s\\S]+))?$`, 'i');
  cmd.public = cmd.public || false;
  cmd.isGroup = cmd.isGroup || false;
  cmd.dontAddCommandList = cmd.dontAddCommandList || false;
  commands.push(cmd);
  return cmd;
};

async function ExecuteCommands(data, msg, client) {
  if (!msg.body) return;
  const { disablegc, disabledm, cmdReact, cmdRead, disabledCmds } = await getConfig();

  for (const cmd of commands) {
    const handler = msg.prefix.find((p) => msg.body.startsWith(p));
    const match = msg.body.slice(handler.length).match(cmd.pattern);
    if (handler && match) {
      if (msg.isGroup && disablegc && `${handler}${match[2]}` !== `${handler}enablegc`) return;
      if (!msg.isGroup && disabledm && msg.from !== msg.user) return;
      if (disabledCmds.includes(match[1])) return await msg.send(LANG.DISABLED_CMD);

      const args = match[2] ?? '';

      if (msg.mode && !msg.sudo) return;
      if (msg.isban) return await msg.send(LANG.BANNED);
      if (cmd.isGroup && !msg.isGroup) return msg.send(LANG.GROUP_ONLY);
      if (!msg.mode && !cmd.public && !msg.sudo) return await msg.send(LANG.PRIVATE_ONLY);
      if (cmdReact) await data.react('⏳');
      if (cmdRead) await client.readMessages([msg.key]);

      try {
        await cmd.function(data, args, { ...data, ...msg, ...client });
        return await data.react('');
      } catch (err) {
        return msg.error(cmd, err);
      }
    }
  }
}

const CommandEvents = async (data, msg, client) => {
  const listeners = commands.filter((cmd) => cmd.on);

  for (const command of listeners) {
    await command.function(data, { ...msg, ...data, ...client });
  }
};

export { commands, bot, ExecuteCommands, CommandEvents };
