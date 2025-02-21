import config from "../config.mjs";
import { Module, commands, formatBytes, getRandom, runtime } from "#default";
import { platform, totalmem, freemem } from "os";

Module(
    {
        name: "menu",
        fromMe: false,
        desc: "Show All Commands",
        type: undefined,
        dontAddCommandList: true,
    },
    async (message) => {
        const cmds = commands.filter((cmd) => cmd.name && !cmd.dontAddCommandList && !cmd.name.toString().includes("undefined")).length;
        let menuInfo = `\`\`\`
╭─── ${config.BOT_INFO.split(";")[1]} ────
│ Prefix: ${getRandom(message.prefix)}
│ Owner: ${config.BOT_INFO.split(";")[0]}		
│ Plugins: ${cmds}
│ Mode: ${message.mod ? "Private" : "Public"}
│ Uptime: ${runtime(process.uptime())}
│ Platform: ${platform()}
│ Ram: ${formatBytes(totalmem() - freemem())}
│ Day: ${new Date().toLocaleDateString("en-US", { weekday: "long" })}
│ Date: ${new Date().toLocaleDateString("en-US")}
│ Time: ${new Date().toLocaleTimeString("en-US", { timeZone: config.TIME_ZONE })}
│ Version: ${config.VERSION}
╰─────────────\`\`\`\n`;

        const commandsByType = commands
            .filter((cmd) => cmd.name && !cmd.dontAddCommandList)
            .reduce((acc, cmd) => {
                const type = cmd.type || "Misc";
                if (!acc[type]) {
                    acc[type] = [];
                }
                acc[type].push(cmd.name.toString().toLowerCase().split(/\W+/)[2]);
                return acc;
            }, {});

        const sortedTypes = Object.keys(commandsByType).sort();

        let totalCommands = 1;

        sortedTypes.forEach((type) => {
            const sortedCommands = commandsByType[type].sort();
            menuInfo += (`╭──── *${type}* ────\n`);
            sortedCommands.forEach((cmd) => {
                menuInfo += (`│${totalCommands}· ${cmd}\n`);
                totalCommands++;
            });
            menuInfo +=(`╰────────────\n`);
        });
        return await message.send(menuInfo.trim());
    }
);

Module(
    {
        name: "list",
        fromMe: false,
        desc: "Show All Commands",
        type: undefined,
        dontAddCommandList: true,
    },
    async (message) => {
        let cmdsList: string = "Command List\n\n";
        let cmdList: { cmd: string; desc?: string }[] = [];
        let cmd: string | undefined;
        let desc: string | undefined;

        commands.map((command) => {
            if (command.name) {
                const parts = command.name.toString().split(/\W+/);
                cmd = parts.length > 2 ? parts[2] : undefined;
            }
            desc = command?.desc;
            if (!command.dontAddCommandList && cmd !== undefined) cmdList.push({ cmd, desc });
        });

        cmdList.sort((a, b) => a.cmd.localeCompare(b.cmd));
        cmdList.forEach(({ cmd, desc }, num) => {
            cmdsList += `${num + 1} ${cmd}\n`;
            if (desc) cmdsList += `${desc}\n\n`;
        });

        return await message.reply(cmdsList);
    }
);
