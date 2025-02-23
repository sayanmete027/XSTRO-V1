import { makeWASocket, makeCacheableSignalKeyStore, DisconnectReason, Browsers, WAProto, WASocket } from "baileys";
import { Boom } from "@hapi/boom";
import * as P from "pino";
import { EventEmitter } from "events";
import * as CacheStore from "./store.mjs";
import {
    Xprocess,
    useSQLiteAuthState,
    groupMetadata,
    saveGroupMetadata,
    /**loadMessage,**/ Message,
    runCommand,
    evaluator,
    Store,
    upsertChat,
    upsertMessages,
    updateChat,
    setBlocklist,
    saveCalls,
    editLabel,
    updateLabelAssociation,
    updateBlocklist,
    saveGroupJoinRequest,
    updateGroupParticipants,
    updateGroups,
    upsertGroups,
    updateMessageReceipts,
    saveMessageReactions,
    updateMessageMedia,
    deleteMessages,
    updateContacts,
    upsertContacts,
    deleteChats,
    updatePresence,
    savePhoneNumberShare,
    updateMessages,
} from "#default";
import config from "../../config.mjs";

EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);

export const logger = P.pino({
    level: config.DEBUG ? "info" : "silent",
});

export const client = async (database: string = "database.db"): Promise<WASocket> => {
    const { state, saveCreds } = await useSQLiteAuthState(database);
    const cache = new CacheStore.default();
    await Store();

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
        // getMessage: async (key) => {
        //     const store = await loadMessage(key?.id!);
        //     return store ? WAProto.Message.fromObject(store) : { conversation: undefined };
        // },
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
            const { messages, type, requestId } = events["messages.upsert"];
            await upsertMessages({ messages, type, requestId });
            if (type === "notify") {
                for (const message of messages) {
                    const msg = await Message(conn, message!);
                    Promise.all([runCommand(msg), evaluator(msg)]);
                }
            }
        }
        if (events["messages.update"]) {
            const messageUpdates = events["messages.update"];
            if (messageUpdates) {
                await updateMessages(messageUpdates);
            }
        }
        if (events["chats.upsert"]) {
            const chatUpserts = events["chats.upsert"];
            if (chatUpserts) {
                for (const chat of chatUpserts) {
                    await upsertChat(chat);
                }
            }
        }
        if (events["chats.update"]) {
            const chatUpserts = events["chats.update"];
            if (chatUpserts) {
                for (const updates of chatUpserts) {
                    await updateChat(updates);
                }
            }
        }
        if (events["blocklist.set"]) {
            const blocklist = events["blocklist.set"];
            if (blocklist) {
                await setBlocklist(blocklist);
            }
        }
        if (events["blocklist.update"]) {
            const blocklistUpdates = events["blocklist.update"];
            if (blocklistUpdates) {
                await updateBlocklist(blocklistUpdates);
            }
        }
        if (events["call"]) {
            const calls = events["call"];
            if (calls) {
                await saveCalls(calls);
            }
        }
        if (events["labels.edit"]) {
            const editedLabels = events["labels.edit"];
            if (editedLabels) {
                await editLabel(editedLabels);
            }
        }
        if (events["labels.association"]) {
            const associations = events["labels.association"];
            if (associations) {
                await updateLabelAssociation(associations);
            }
        }
        if (events["group.join-request"]) {
            const Requests = events["group.join-request"];
            if (Requests) {
                await saveGroupJoinRequest(Requests);
            }
        }
        if (events["group-participants.update"]) {
            const participantsUpdate = events["group-participants.update"];
            if (participantsUpdate) {
                await updateGroupParticipants(participantsUpdate);
            }
        }
        if (events["groups.update"]) {
            const groupUpdates = events["groups.update"];
            if (groupUpdates) {
                await updateGroups(groupUpdates);
            }
        }
        if (events["groups.upsert"]) {
            const groupUpdates = events["groups.upsert"];
            if (groupUpdates) {
                await upsertGroups(groupUpdates);
            }
        }
        if (events["message-receipt.update"]) {
            const receipts = events["message-receipt.update"];
            if (receipts) {
                await updateMessageReceipts(receipts);
            }
        }
        if (events["messages.reaction"]) {
            const reactions = events["messages.reaction"];
            if (reactions) {
                await saveMessageReactions(reactions);
            }
        }
        if (events["messages.media-update"]) {
            const mediaUpdates = events["messages.media-update"];
            if (mediaUpdates) {
                await updateMessageMedia(mediaUpdates);
            }
        }
        if (events["messages.delete"]) {
            const deletedMsg = events["messages.delete"];
            if (deletedMsg) {
                await deleteMessages(deletedMsg);
            }
        }
        if (events["contacts.update"]) {
            const contactUpdates = events["contacts.update"];
            if (contactUpdates) {
                await updateContacts(contactUpdates);
            }
        }
        if (events["contacts.upsert"]) {
            const contactUpsert = events["contacts.upsert"];
            if (contactUpsert) {
                await upsertContacts(contactUpsert);
            }
        }
        if (events["chats.delete"]) {
            const deletedChats = events["chats.delete"];
            if (deletedChats) {
                await deleteChats(deletedChats);
            }
        }
        if (events["presence.update"]) {
            const presence = events["presence.update"];
            if (presence) {
                await updatePresence(presence);
            }
        }
        if (events["chats.phoneNumberShare"]) {
            const shareNums = events["chats.phoneNumberShare"];
            if (shareNums) {
                await savePhoneNumberShare(shareNums);
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
