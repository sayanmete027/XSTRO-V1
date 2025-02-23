import { MessageType } from "#default";
import util from "util";

export async function evaluator(message: MessageType) {
    if (!message.text) return;

    if (message.text.startsWith("$ ")) {
        try {
            const code = message.text.slice(2);
            const result = await eval(`(async () => { ${code} })()`);
            await message.send(util.inspect(result, { depth: 1 }));
        } catch (error) {
            await message.send("Error: " + (error instanceof Error ? error.message : String(error)));
        }
    }
}
