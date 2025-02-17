import { Message } from "../../src/index.mjs";

interface Command {
  name: RegExp | string;
  function?: Function;
  fromMe?: boolean;
  isGroup?: boolean;
  desc: string | undefined;
  type: string | undefined;
  dontAddCommandList?: boolean;
}

export const commands: Command[] = [];

export function Module(cmd: Omit<Command, 'function'>, func: Function): Command {
  const fullCmd: Command = {
    ...cmd,
    function: func,
    name: new RegExp(`^\\s*(${cmd.name})(?:\\s+([\\s\\S]+))?$`, 'i'),
    fromMe: cmd.fromMe || false,
    isGroup: cmd.isGroup || false,
    dontAddCommandList: cmd.dontAddCommandList || false,
  };
  commands.push(fullCmd);
  return fullCmd;
}

export async function runCommand(message: Message): Promise<void> {
  if (!message.text) return;
  if (message.mod && !message.sudo) return

  for (const cmd of commands) {
    const handler = message.prefix.find((p) => message?.text?.startsWith(p));
    const match = message.text.slice(handler?.length || 0).match(cmd.name);
    if (cmd.fromMe && !message.sudo) return
    if (message.ban && !message.sudo) return message.send('You are banned from using commands')
    try {
      if (handler && match) {
        const args = match[2] ?? '';
        await cmd.function!(message, args);
      }
    } catch (err) {
      const cmdName = cmd.name.toString().toLowerCase().split(/\W+/)[2]
      await message.error(err as Error, cmdName);
    }
  }
}