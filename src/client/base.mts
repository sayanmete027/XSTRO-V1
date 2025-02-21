import { makeWASocket, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason, Browsers, WAProto, WASocket } from "baileys";
import { Xprocess, useSQLiteAuthState, MessageUpsert, groupMetadata, saveGroupMetadata, loadMessage } from "#default";

import * as P from "pino";
import { Boom } from "@hapi/boom";
import { EventEmitter } from "events";
import fs from "fs";
import path from "path";

import config from "../../config.mjs";
import CacheStore from "./store.mjs";

EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);

const logDir = path.resolve("./debug");
const logFile = path.join(logDir, "logs.log");

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Logger Setup
export const logger = P.pino(
    {
        level: config.DEBUG ? "info" : "silent",
    },
    P.pino.destination(logFile)
);

export const client = async (database: string): Promise<WASocket> => {
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

    /**
     * Inspriation from
     */
    conn.ev.process(
        // events is a map for event name => event data
        async (events) => {
            /**
             * We handle connection Setup
             */
            if (events["connection.update"]) {
                const { connection, lastDisconnect } = events["connection.update"];

                if (connection === "connecting") {
                    console.log("connecting...");
                }
                if (connection === "close") {
                    if ((lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.loggedOut) {
                        Xprocess("stop");
                    } else {
                        client(database);
                    }
                }
                if (connection === "open") {
                    console.log("Connected!");
                    await conn.sendMessage(conn?.user?.id!, { text: `BeepBoi Hello 👋` });
                }
            }

            /**
             * Save creds to our sqlite3 store
             */
            if (events["creds.update"]) {
                await saveCreds();
            }

            if (events["messages.upsert"]) {
                await MessageUpsert({ events: events["messages.upsert"] }, conn);
            }
        }
    );

    // Group Metadata Sync
    setInterval(async () => {
        const groupsMetadata = await conn.groupFetchAllParticipating();
        logger.info(groupMetadata)
        for (const [id, metadata] of Object.entries(groupsMetadata)) {
            await saveGroupMetadata(id, metadata);
        }
    }, 300 * 1000);

    return conn;
};
