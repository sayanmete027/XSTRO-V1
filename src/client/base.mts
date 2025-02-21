// Core Dependencies
import { makeWASocket, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason, Browsers, WAProto, WASocket } from "baileys";
import * as P from "pino";
import { Boom } from "@hapi/boom";
import { EventEmitter } from "events";
import fs from "fs";
import path from "path";

// Custom Modules
import config from "../../config.mjs";
import { Xprocess, useSQLiteAuthState, MessageUpsert, groupMetadata, saveGroupMetadata, loadMessage } from "../../src/index.mjs";
import CacheStore from "./store.mjs";

// Configuration
EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);

const logDir = path.resolve("./debug");
const logFile = path.join(logDir, "logs.log");

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Logger Setup
export const logger = P.pino(
    {
        level: config.DEBUG ? "info" : "silent",
    },
    P.pino.destination(logFile)
);

// Main Client Function
export const client = async (database: string): Promise<WASocket> => {
    // Authentication Setup
    const session = await useSQLiteAuthState(database || "database.db");
    const { state, saveCreds } = session;
    const cache = new CacheStore();

    // WhatsApp Socket Configuration
    const conn = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger, cache),
        },
        printQRInTerminal: true,
        logger,
        browser: Browsers.macOS("Desktop"),
        version: (await fetchLatestBaileysVersion()).version,
        emitOwnEvents: true,
        syncFullHistory: true,
        generateHighQualityLinkPreview: true,
        cachedGroupMetadata: async (jid) => (await groupMetadata(jid)) ?? undefined,
        getMessage: async (key) => {
            const store = await loadMessage(key?.id!);
            return store ? WAProto.Message.fromObject(store) : { conversation: undefined };
        },
    });

    // Event Processing
    conn.ev.process(async (events) => {
        // Connection Updates
        if (events["connection.update"]) {
            const { connection, lastDisconnect } = events["connection.update"];

            switch (connection) {
                case "connecting":
                    console.log("connecting...");
                    break;
                case "close":
                    (lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.loggedOut ? Xprocess("stop") : client(database);
                    break;
                case "open":
                    console.log("Connected!");
                    break;
            }
        }

        // Credentials Update
        if (events["creds.update"]) {
            await saveCreds();
        }

        // Message Handling
        if (events["messages.upsert"]) {
            await MessageUpsert(events["messages.upsert"]);
        }
    });

    // Group Metadata Sync
    setInterval(async () => {
        const groupsMetadata = await conn.groupFetchAllParticipating();
        for (const [id, metadata] of Object.entries(groupsMetadata)) {
            await saveGroupMetadata(id, metadata);
        }
    }, 300 * 1000);

    return conn;
};
