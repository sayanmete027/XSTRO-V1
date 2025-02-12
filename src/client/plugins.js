export const commands = [];

export function bot(cmd, func) {
  cmd.function = func;
  cmd.pattern = new RegExp(`^\\s*(${cmd.pattern})(?:\\s+([\\s\\S]+))?$`, 'i');
  cmd.public = cmd.public || false;
  cmd.isGroup = cmd.isGroup || false;
  cmd.dontAddCommandList = cmd.dontAddCommandList || false;
  commands.push(cmd);
  return cmd;
}

export async function runCommand(Instance, message, client) {
  if (!message.body) return;

  for (const cmd of commands) {
    if (cmd.on) cmd.function(Instance, args, { ...Instance, ...message, ...client });
    const handler = message.prefix.find((p) => message.body.startsWith(p));
    const match = message.body.slice(handler.length).match(cmd.pattern);
    if (handler && match) {
      const args = match[2] ?? '';

      try {
        await cmd.function(Instance, args, { ...Instance, ...message, ...client });
      } catch (err) {
        return message.error(cmd, err);
      }
    }
  }
}
