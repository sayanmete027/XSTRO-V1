"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluator = evaluator;
const util_1 = __importDefault(require("util"));
async function evaluator(message) {
    if (!message.text)
        return;
    if (message.text.startsWith('$ ')) {
        try {
            const code = message.text.slice(2);
            const result = await eval(`(async () => { ${code} })()`);
            await message.send(util_1.default.inspect(result, { depth: 5 }));
        }
        catch (error) {
            await message.send('Error: ' + error.message);
        }
    }
}
