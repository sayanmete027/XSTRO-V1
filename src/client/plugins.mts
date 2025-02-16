import { WASocket } from "baileys";
import { Message } from "../../types/index.mjs";

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

  for (const cmd of commands) {
    const handler = message.prefix.find((p) => message?.text?.startsWith(p));
    const match = message.text.slice(handler?.length || 0).match(cmd.name);
    try {
      if (handler && match) {
        const args = match[2] ?? '';
        await cmd.function!(message, args);
      }
    } catch (err) {
      // await message.error(cmd, err as Error);
    }
  }
}