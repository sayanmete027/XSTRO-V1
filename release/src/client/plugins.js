"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
    dontAddCommandList: cmd.dontAddCommandList || false
  };
  exports.commands.push(fullCmd);
  return fullCmd;
}
async function runCommand(message, client) {
  if (!message.text) return;
  for (const cmd of exports.commands) {
    const handler = message.prefix.find(p => message?.text?.startsWith(p));
    const match = message.text.slice(handler?.length || 0).match(cmd.name);
    try {
      if (handler && match) {
        const args = match[2] ?? '';
        await cmd.function(message, args, {
          ...message,
          ...client
        });
      }
    } catch (err) {
      // await message.error(cmd, err as Error);
    }
  }
}