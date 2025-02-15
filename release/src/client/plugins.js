"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = void 0;
exports.Module = Module;
exports.runCommand = runCommand;
exports.commands = [];
function Module(cmd, func) {
    const fullCmd = {
        ...cmd,
        function: func,
        name: new RegExp(`^\\s*(${cmd.name})(?:\\s+([\\s\\S]+))?$`, 'i'),
        fromMe: cmd.fromMe || false,
        isGroup: cmd.isGroup || false,
        dontAddCommandList: cmd.dontAddCommandList || false,
    };
    exports.commands.push(fullCmd);
    return fullCmd;
}
async function runCommand(message, client) {
    var _a;
    if (!message.text)
        return;
    for (const cmd of exports.commands) {
        const handler = message.prefix.find((p) => { var _a; return (_a = message === null || message === void 0 ? void 0 : message.text) === null || _a === void 0 ? void 0 : _a.startsWith(p); });
        const match = message.text.slice((handler === null || handler === void 0 ? void 0 : handler.length) || 0).match(cmd.name);
        try {
            if (handler && match) {
                const args = (_a = match[2]) !== null && _a !== void 0 ? _a : '';
                await cmd.function(message, args, { ...message, ...client });
            }
        }
        catch (err) {
            // await message.error(cmd, err as Error);
        }
    }
}
