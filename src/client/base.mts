import { makeWASocket, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason, Browsers, WAProto, WASocket } from "baileys";
import { Xprocess, useSQLiteAuthState, MessageUpsert, groupMetadata, saveGroupMetadata, loadMessage, MessageUpdate, WACallEvent } from "#default";

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
        cachedGroupMetadata: async (jid) => (await groupMetadata(jid)) ?? undefined,
        getMessage: async (key) => {
            const store = await loadMessage(key?.id!);
            return store ? WAProto.Message.fromObject(store) : { conversation: undefined };
        },
    });

    conn.ev.process(
        // events is a map for event name => event data
        async (events) => {
            if (events["connection.update"]) {
                const { connection, lastDisconnect } = events["connection.update"];

                if (connection === "connecting") console.log("connecting...");
                if (connection === "open") console.log("Connected!");

                if (connection === "close") {
                    if ((lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.loggedOut) {
                        Xprocess("stop");
                    } else {
                        client(database);
                    }
                }
            }

            events["creds.update"] && (await saveCreds());
            events["messages.upsert"] && (await MessageUpsert({ events: events["messages.upsert"] }, conn));
            events["messages.update"] && (await MessageUpdate({ events: events["messages.update"] }, conn));
            events["call"] && (await WACallEvent({ events: events["call"] }, conn));
        }
    );

    // Group Metadata Sync
    setInterval(async () => {
        const groupsMetadata = await conn.groupFetchAllParticipating();
        logger.info(groupMetadata);
        for (const [id, metadata] of Object.entries(groupsMetadata)) {
            await saveGroupMetadata(id, metadata);
        }
    }, 300 * 1000);

    return conn;
};
