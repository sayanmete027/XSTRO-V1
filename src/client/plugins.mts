import { WASocket } from "baileys/lib/index.js";
import { LANG, Message } from "#default";

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

export function Module(cmd: Partial<Command>, func: Function): Command {
    const fullCmd: Command = {
        name: new RegExp(`^\\s*(${cmd.name})(?:\\s+([\\s\\S]+))?$`, "i"),
        function: func,
        fromMe: cmd.fromMe || false,
        isGroup: cmd.isGroup || false,
        desc: cmd.desc,
        type: cmd.type,
        dontAddCommandList: cmd.dontAddCommandList || false,
    };
    commands.push(fullCmd);
    return fullCmd;
}

export async function runCommand(message: Message, client: WASocket): Promise<void> {
    if (!message.text) return;
    if (message.mod && !message.sudo) return;

    for (const cmd of commands) {
        const handler = message.prefix.find((p) => message?.text?.startsWith(p));
        const match = message.text.slice(handler?.length || 0).match(cmd.name);
        if (cmd.fromMe && !message.sudo) return;
        try {
            if (handler && match) {
                if (cmd.isGroup && !message.isGroup) return message.send(LANG.GROUP_ONLY);
                if (message.ban && !message.sudo) return message.send(LANG.BANNED);
                const args = match[2] ?? "";
                await cmd.function!(message, args, client);
            }
        } catch (err) {
            const cmdName = cmd.name.toString().toLowerCase().split(/\W+/)[2];
            await message.error(err as Error, cmdName);
        }
    }
}
