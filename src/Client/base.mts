import { makeWASocket, makeCacheableSignalKeyStore, DisconnectReason, Browsers, WAProto, WASocket } from "baileys";
import { Boom } from "@hapi/boom";
import * as P from "pino";
import { EventEmitter } from "events";
import * as CacheStore from "./store.mjs";
import { Xprocess, useSQLiteAuthState, groupMetadata, saveGroupMetadata, loadMessage, Message } from "#default";
import config from "../../config.mjs";

EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);

export const logger = P.pino({
    level: config.DEBUG ? "info" : "silent",
});

export const client = async (database: string = "database.db"): Promise<WASocket> => {
    const { state, saveCreds } = await useSQLiteAuthState(database);
    const cache = new CacheStore.default();

    const conn = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger, cache),
        },
        printQRInTerminal: true,
        logger,
        browser: Browsers.macOS("Desktop"),
        emitOwnEvents: true,
        cachedGroupMetadata: async (jid) => await groupMetadata(jid),
        getMessage: async (key) => {
            const store = await loadMessage(key?.id!);
            return store ? WAProto.Message.fromObject(store) : { conversation: undefined };
        },
    });

    conn.ev.process(async (events) => {
        if (events["connection.update"]) {
            const { connection, lastDisconnect } = events["connection.update"];
            if (connection === "connecting") console.log("connecting...");
            else if (connection === "close") (lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.loggedOut ? Xprocess("stop") : client(database);
            else if (connection === "open") console.log(`Connected!`);
        }

        if (events["creds.update"]) await saveCreds();

        if (events["messages.upsert"]) {
            const { messages } = events["messages.upsert"];
            for (const message of messages) {
                const msg = await Message(conn, message!);
                console.log(`Next MEssage DATA:`,msg);
                if (msg.message!.extendedTextMessage!.text?.includes("hi")) {
                    await msg.send("hi");
                }
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
