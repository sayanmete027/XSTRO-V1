import { runCommand, saveMessage, serialize } from "#default";
import { Initator } from "./initator.mjs";
import { WASocket } from "baileys";

export async function MessageUpsert(updates: { events: Partial<import("baileys").BaileysEventMap["messages.upsert"]> }, client: WASocket) {
    const { messages } = updates.events;
    for (const message of messages || []) {
        const msg = await serialize(structuredClone(message), client);
        if (!msg) continue;

        await Promise.all([runCommand(msg, client), Initator(msg, client), saveMessage(msg)]);
    }
}
