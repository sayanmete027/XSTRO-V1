import { WASocket } from "../../resources";
import { Message } from "../../types";

interface Command {
  name: RegExp | string;
  function: Function;
  fromMe?: boolean;
  isGroup?: boolean;
  dontAddCommandList?: boolean;
}

export const commands: Command[] = [];

export function Module(cmd: Command, func: Function): Command {
  cmd.function = func;
  cmd.name = new RegExp(`^\\s*(${cmd.name})(?:\\s+([\\s\\S]+))?$`, 'i');
  cmd.fromMe = cmd.fromMe || false;
  cmd.isGroup = cmd.isGroup || false;
  cmd.dontAddCommandList = cmd.dontAddCommandList || false;
  commands.push(cmd);
  return cmd;
}

export async function runCommand(message: Message, client: WASocket): Promise<void> {
  if (!message.text) return;

  for (const cmd of commands) {
    const handler = message.prefix.find((p) => message?.text?.startsWith(p));
    const match = message.text.slice(handler?.length || 0).match(cmd.name);
    try {
      if (handler && match) {
        const args = match[2] ?? '';
        await cmd.function(message, args, { ...message, ...client });
      }
    } catch (err) {
      await message.error(cmd, err as Error);
    }
  }
}