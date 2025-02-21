import { makeWASocket, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason, Browsers, WAProto, WASocket } from "baileys";
import { Xprocess, useSQLiteAuthState, groupMetadata, saveGroupMetadata, loadMessage } from "#default";
import * as CacheStore from './store.mjs'
import * as P from "pino";
import { Boom } from "@hapi/boom";
import { EventEmitter } from "events";
import config from "../../config.mjs";

EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);

export const logger = P.pino(
    {
        level: config.DEBUG ? "info" : "silent",
    },
);

export const client = async (database: string): Promise<WASocket> => {
    const session = await useSQLiteAuthState(database ? database : "database.db");
    const { state, saveCreds } = session;
    const cache = new CacheStore.default();

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

    conn.ev.process(async (events) => {
        if (events["connection.update"]) {
            const { connection, lastDisconnect } = events["connection.update"];

            if (connection === "connecting") {
                console.log("connecting...");
            } else if (connection === "close") {
                (lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.loggedOut ? Xprocess("stop") : client(database);
            } else if (connection === "open") {
                console.log(`Connected!`);
            }
        }

        if (events["creds.update"]) await saveCreds();

        if (events["messages.upsert"]) {
            const { messages } = events["messages.upsert"];
            for (const message of messages) {
                logger.info(structuredClone(message))
            }
        }
    });

    setInterval(async () => {
        const groupsMetadata = await conn.groupFetchAllParticipating();
        for (const [id, metadata] of Object.entries(groupsMetadata)) {
            await saveGroupMetadata(id, metadata);
        }
    }, 300 * 1000);

    return conn;
};
