import { WASocket } from "baileys";

export async function MessageUpdate(updates: { events: Partial<import("baileys").BaileysEventMap["messages.update"]> }, client: WASocket) {}
