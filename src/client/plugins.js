export const commands = [];

export function Module(cmd, func) {
  cmd.function = func;
  cmd.name = new RegExp(`^\\s*(${cmd.name})(?:\\s+([\\s\\S]+))?$`, 'i');
  cmd.fromMe = cmd.fromMe || false;
  cmd.isGroup = cmd.isGroup || false;
  cmd.dontAddCommandList = cmd.dontAddCommandList || false;
  commands.push(cmd);
  return cmd;
}

export async function runCommand(message, client) {
  if (!message.body) return;

  for (const cmd of commands) {
    const handler = message.prefix.find((p) => message.body.startsWith(p));
    const match = message.body.slice(handler?.length || 0).match(cmd.name);
    const mods = { ...message, ...client };
    try {
      if (handler && match) {
        const args = match[2] ?? '';
        await cmd.function(message, args, mods);
      }
    } catch (err) {
      await message.error(cmd, err);
    }
  }
}
