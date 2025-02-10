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

async function ExecuteCommands(WaInstance, Message, Socket) {
  if (!Message.body) return;
  const { disablegc, disabledm, cmdReact, cmdRead, disabledCmds } = await getConfig();

  for (const cmd of commands) {
    const handler = Message.prefix.find((p) => Message.body.startsWith(p));
    const match = Message.body.slice(handler.length).match(cmd.pattern);
    if (handler && match) {
      if (Message.isGroup && disablegc && `${handler}${match[2]}` !== `${handler}enablegc`) return;
      if (!Message.isGroup && disabledm && Message.from !== Message.user) return;
      if (disabledCmds.includes(match[1])) return await Message.send(LANG.DISABLED_CMD);

      const args = match[2] ?? '';

      if (Message.mode && !Message.sudo) return;
      if (Message.isban) return await Message.send(LANG.BANNED);
      if (cmd.isGroup && !Message.isGroup) return Message.send(LANG.GROUP_ONLY);
      if (!Message.mode && !cmd.public && !Message.sudo)
        return await Message.send(LANG.PRIVATE_ONLY);
      if (cmdReact) await WaInstance.react('⏳');
      if (cmdRead) await Socket.readMessages([Message.key]);

      try {
        await cmd.function(WaInstance, args, { ...WaInstance, ...Message, ...Socket });
        return await WaInstance.react('');
      } catch (err) {
        return Message.error(cmd, err);
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
