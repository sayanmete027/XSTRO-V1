import { WASocket } from "baileys/lib/index.js";

export async function WACallEvent(updates: { events: Partial<import("baileys").BaileysEventMap["call"]> }, client: WASocket) {}
