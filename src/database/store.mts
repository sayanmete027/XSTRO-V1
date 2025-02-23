import { Database } from "sqlite";
import { getDb } from "./database.mjs";
import {
    Chat,
    ChatUpdate,
    PresenceData,
    Contact,
    WAMessageKey,
    WAMessageUpdate,
    WAMessage,
    MessageUpsertType,
    WACallEvent,
    ParticipantAction,
    RequestJoinMethod,
    RequestJoinAction,
    GroupMetadata,
    MessageUserReceiptUpdate,
    WAProto,
    GroupParticipant,
} from "baileys";
import { Boom } from "@hapi/boom";
import { LabelAssociation, LabelAssociationType, MessageLabelAssociation } from "baileys/lib/Types/LabelAssociation.js";
import { Label } from "baileys/lib/Types/Label.js";
import { groupMetadata, ParticipantActivity } from "#default";

export async function Store(): Promise<void> {
    const db: Database = await getDb();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS chats (
            id TEXT PRIMARY KEY,
            lastMessageRecvTimestamp INTEGER,
            data JSON
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS phone_number_shares (
            lid TEXT,
            jid TEXT,
            PRIMARY KEY (lid, jid)
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS presences (
            id TEXT,
            participant TEXT,
            lastKnownPresence TEXT,
            lastSeen INTEGER,
            PRIMARY KEY (id, participant)
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS contacts (
            id TEXT PRIMARY KEY,
            lid TEXT,
            name TEXT,
            notify TEXT,
            verifiedName TEXT,
            imgUrl TEXT,
            status TEXT
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            remoteJid TEXT,
            id TEXT,
            fromMe INTEGER,
            participant TEXT,
            messageTimestamp INTEGER,
            status TEXT,
            data JSON,
            requestId TEXT,
            upsertType TEXT,
            PRIMARY KEY (remoteJid, id, fromMe)
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS message_media (
            remoteJid TEXT,
            id TEXT,
            fromMe INTEGER,
            ciphertext BLOB,
            iv BLOB,
            error TEXT,
            PRIMARY KEY (remoteJid, id, fromMe)
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS message_reactions (
            remoteJid TEXT,
            id TEXT,
            fromMe INTEGER,
            reaction TEXT,
            PRIMARY KEY (remoteJid, id, fromMe)
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS message_receipts (
            remoteJid TEXT,
            id TEXT,
            fromMe INTEGER,
            userJid TEXT,
            data JSON,
            PRIMARY KEY (remoteJid, id, fromMe, userJid)
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS groups (
            id TEXT PRIMARY KEY,
            data JSON
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS group_participants (
            groupId TEXT,
            participant TEXT,
            action TEXT,
            author TEXT,
            timestamp INTEGER DEFAULT (strftime('%s', 'now')),
            PRIMARY KEY (groupId, participant, timestamp)
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS group_join_requests (
            groupId TEXT,
            participant TEXT,
            author TEXT,
            action TEXT,
            method TEXT,
            timestamp INTEGER DEFAULT (strftime('%s', 'now')),
            PRIMARY KEY (groupId, participant, timestamp)
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS blocklist (
            jid TEXT PRIMARY KEY
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS calls (
            id TEXT PRIMARY KEY,
            chatId TEXT,
            fromJid TEXT,
            data JSON
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS labels (
            id TEXT PRIMARY KEY,
            data JSON
        )
    `);
    await db.exec(`
        CREATE TABLE IF NOT EXISTS label_associations (
            type TEXT,
            chatId TEXT,
            messageId TEXT,
            labelId TEXT,
            PRIMARY KEY (type, chatId, messageId, labelId)
        )
    `);
}

export async function upsertChat(chat: Chat): Promise<void> {
    const db: Database = await getDb();
    await db.run(
        `
        INSERT OR REPLACE INTO chats (id, lastMessageRecvTimestamp, data)
        VALUES (?, ?, ?)
    `,
        [chat.id, chat.lastMessageRecvTimestamp, JSON.stringify(chat)]
    );
}

export async function updateChat(chatUpdate: ChatUpdate): Promise<void> {
    const db: Database = await getDb();
    await db.run(
        `
        UPDATE chats 
        SET 
            lastMessageRecvTimestamp = ?,
            data = ?
        WHERE id = ?
    `,
        [chatUpdate.lastMessageRecvTimestamp, JSON.stringify(chatUpdate), chatUpdate.id]
    );
}

export async function savePhoneNumberShare(share: { lid: string; jid: string }): Promise<void> {
    const db: Database = await getDb();
    await db.run(
        `
        INSERT OR REPLACE INTO phone_number_shares (lid, jid)
        VALUES (?, ?)
    `,
        [share.lid, share.jid]
    );
}

export async function deleteChats(chatIds: string[]): Promise<void> {
    const db: Database = await getDb();
    const placeholders = chatIds.map(() => "?").join(",");
    await db.run(
        `
        DELETE FROM chats 
        WHERE id IN (${placeholders})
    `,
        chatIds
    );
}

export async function updatePresence(presenceUpdate: { id: string; presences: { [participant: string]: PresenceData } }): Promise<void> {
    const db: Database = await getDb();
    const stmt = await db.prepare(`
        INSERT OR REPLACE INTO presences (id, participant, lastKnownPresence, lastSeen)
        VALUES (?, ?, ?, ?)
    `);

    try {
        for (const [participant, presence] of Object.entries(presenceUpdate.presences)) {
            await stmt.run([presenceUpdate.id, participant, presence.lastKnownPresence, presence.lastSeen]);
        }
    } finally {
        await stmt.finalize();
    }
}

export async function upsertContacts(contacts: Contact[]): Promise<void> {
    const db: Database = await getDb();
    const stmt = await db.prepare(`
        INSERT OR REPLACE INTO contacts (id, lid, name, notify, verifiedName, imgUrl, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    try {
        for (const contact of contacts) {
            await stmt.run([contact.id, contact.lid, contact.name, contact.notify, contact.verifiedName, contact.imgUrl, contact.status]);
        }
    } finally {
        await stmt.finalize();
    }
}

export async function updateContacts(contactUpdates: Partial<Contact>[]): Promise<void> {
    const db: Database = await getDb();
    const stmt = await db.prepare(`
        UPDATE contacts 
        SET 
            lid = COALESCE(?, lid),
            name = COALESCE(?, name),
            notify = COALESCE(?, notify),
            verifiedName = COALESCE(?, verifiedName),
            imgUrl = COALESCE(?, imgUrl),
            status = COALESCE(?, status)
        WHERE id = ?
    `);

    try {
        for (const update of contactUpdates) {
            await stmt.run([update.lid, update.name, update.notify, update.verifiedName, update.imgUrl, update.status, update.id]);
        }
    } finally {
        await stmt.finalize();
    }
}

export async function deleteMessages(deleteRequest: { keys: WAMessageKey[] } | { jid: string; all: true }): Promise<void> {
    const db: Database = await getDb();

    if ("keys" in deleteRequest) {
        const stmt = await db.prepare(`
            DELETE FROM messages 
            WHERE remoteJid = ? AND id = ? AND fromMe = ?
        `);
        try {
            for (const key of deleteRequest.keys) {
                await stmt.run([key.remoteJid, key.id, key.fromMe ? 1 : 0]);
            }
        } finally {
            await stmt.finalize();
        }
    } else if ("all" in deleteRequest && deleteRequest.all) {
        await db.run(
            `
            DELETE FROM messages 
            WHERE remoteJid = ?
        `,
            [deleteRequest.jid]
        );
    }
}

export async function updateMessages(messageUpdates: WAMessageUpdate[]): Promise<void> {
    const db: Database = await getDb();
    const stmt = await db.prepare(`
        UPDATE messages 
        SET 
            data = ?
        WHERE remoteJid = ? AND id = ? AND fromMe = ?
    `);

    try {
        for (const msgUpdate of messageUpdates) {
            await stmt.run([JSON.stringify(msgUpdate.update), msgUpdate.key.remoteJid, msgUpdate.key.id, msgUpdate.key.fromMe ? 1 : 0]);
        }
    } finally {
        await stmt.finalize();
    }
}

export async function updateMessageMedia(mediaUpdates: { key: WAMessageKey; media?: { ciphertext: Uint8Array; iv: Uint8Array }; error?: Boom }[]): Promise<void> {
    const db: Database = await getDb();
    const stmt = await db.prepare(`
        INSERT OR REPLACE INTO message_media (remoteJid, id, fromMe, ciphertext, iv, error)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
        for (const update of mediaUpdates) {
            await stmt.run([update.key.remoteJid, update.key.id, update.key.fromMe ? 1 : 0, update.media?.ciphertext, update.media?.iv, update.error ? update.error.message : null]);
        }
    } finally {
        await stmt.finalize();
    }
}

export async function upsertMessages(upsert: { messages: WAMessage[]; type: MessageUpsertType; requestId?: string }): Promise<void> {
    const db: Database = await getDb();
    const stmt = await db.prepare(`
        INSERT OR REPLACE INTO messages (
            remoteJid, 
            id, 
            fromMe, 
            participant, 
            messageTimestamp, 
            status, 
            data, 
            requestId, 
            upsertType
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
        for (const message of upsert.messages) {
            const timestamp = typeof message.messageTimestamp === "number" ? message.messageTimestamp : Date.now();

            await stmt.run([
                message.key.remoteJid,
                message.key.id,
                message.key.fromMe ? 1 : 0,
                message.participant || undefined,
                timestamp,
                message.status || undefined,
                JSON.stringify(message),
                upsert.requestId || undefined,
                upsert.type,
            ]);
        }
    } finally {
        await stmt.finalize();
    }
}

export async function saveMessageReactions(reactions: { key: WAMessageKey; reaction: WAProto.IReaction }[]): Promise<void> {
    const db: Database = await getDb();
    const stmt = await db.prepare(`
        INSERT OR REPLACE INTO message_reactions (remoteJid, id, fromMe, reaction)
        VALUES (?, ?, ?, ?)
    `);

    try {
        for (const { key, reaction } of reactions) {
            await stmt.run([key.remoteJid, key.id, key.fromMe ? 1 : 0, reaction.text || null]);
        }
    } finally {
        await stmt.finalize();
    }
}

export async function updateMessageReceipts(receipts: MessageUserReceiptUpdate[]): Promise<void> {
    const db: Database = await getDb();
    const stmt = await db.prepare(`
        INSERT OR REPLACE INTO message_receipts (remoteJid, id, fromMe, userJid, data)
        VALUES (?, ?, ?, ?, ?)
    `);

    try {
        for (const { key, receipt } of receipts) {
            await stmt.run([key.remoteJid, key.id, key.fromMe ? 1 : 0, receipt.userJid, JSON.stringify(receipt)]);
        }
    } finally {
        await stmt.finalize();
    }
}

export async function upsertGroups(groups: GroupMetadata[]): Promise<void> {
    const db: Database = await getDb();
    const stmt = await db.prepare(`
        INSERT OR REPLACE INTO groups (id, data)
        VALUES (?, ?)
    `);

    try {
        for (const group of groups) {
            await stmt.run([group.id, JSON.stringify(group)]);
        }
    } finally {
        await stmt.finalize();
    }
}

export async function updateGroups(groupUpdates: Partial<GroupMetadata>[]): Promise<void> {
    const db: Database = await getDb();
    const stmt = await db.prepare(`
        UPDATE groups 
        SET data = json_patch(data, ?)
        WHERE id = ?
    `);

    try {
        for (const update of groupUpdates) {
            await stmt.run([JSON.stringify(update), update.id]);
        }
    } finally {
        await stmt.finalize();
    }
}

export async function updateGroupParticipants(update: { id: string; author: string; participants: string[]; action: ParticipantAction }): Promise<void> {
    const db: Database = await getDb();
    const stmt = await db.prepare(`
        INSERT INTO group_participants (groupId, participant, action, author)
        VALUES (?, ?, ?, ?)
    `);

    try {
        for (const participant of update.participants) {
            await stmt.run([update.id, participant, update.action, update.author]);
        }
    } finally {
        await stmt.finalize();
    }
}

export async function saveGroupJoinRequest(request: { id: string; author: string; participant: string; action: RequestJoinAction; method: RequestJoinMethod }): Promise<void> {
    const db: Database = await getDb();
    await db.run(
        `
        INSERT INTO group_join_requests (groupId, participant, author, action, method)
        VALUES (?, ?, ?, ?, ?)
    `,
        [request.id, request.participant, request.author, request.action, request.method || null]
    );
}

export async function setBlocklist(blocklist: { blocklist: string[] }): Promise<void> {
    const db: Database = await getDb();
    await db.run(`DELETE FROM blocklist`);
    const stmt = await db.prepare(`
        INSERT INTO blocklist (jid)
        VALUES (?)
    `);

    try {
        for (const jid of blocklist.blocklist) {
            await stmt.run([jid]);
        }
    } finally {
        await stmt.finalize();
    }
}

export async function updateBlocklist(update: { blocklist: string[]; type: "add" | "remove" }): Promise<void> {
    const db: Database = await getDb();
    if (update.type === "add") {
        const stmt = await db.prepare(`
            INSERT OR IGNORE INTO blocklist (jid)
            VALUES (?)
        `);
        try {
            for (const jid of update.blocklist) {
                await stmt.run([jid]);
            }
        } finally {
            await stmt.finalize();
        }
    } else if (update.type === "remove") {
        const placeholders = update.blocklist.map(() => "?").join(",");
        await db.run(
            `
            DELETE FROM blocklist 
            WHERE jid IN (${placeholders})
        `,
            update.blocklist
        );
    }
}

export async function saveCalls(calls: WACallEvent[]): Promise<void> {
    const db: Database = await getDb();
    const stmt = await db.prepare(`
        INSERT OR REPLACE INTO calls (id, chatId, fromJid, data)
        VALUES (?, ?, ?, ?)
    `);

    try {
        for (const call of calls) {
            await stmt.run([call.id, call.chatId, call.from, JSON.stringify(call)]);
        }
    } finally {
        await stmt.finalize();
    }
}

export async function editLabel(label: Label): Promise<void> {
    const db: Database = await getDb();
    await db.run(
        `
        INSERT OR REPLACE INTO labels (id, data)
        VALUES (?, ?)
    `,
        [label.id, JSON.stringify(label)]
    );
}

export async function updateLabelAssociation(association: { association: LabelAssociation; type: "add" | "remove" }): Promise<void> {
    const db: Database = await getDb();
    if (association.type === "add") {
        await db.run(
            `
            INSERT OR IGNORE INTO label_associations (type, chatId, messageId, labelId)
            VALUES (?, ?, ?, ?)
        `,
            [
                association.association.type,
                association.association.chatId,
                association.association.type === LabelAssociationType.Message ? (association.association as MessageLabelAssociation).messageId : null,
                association.association.labelId,
            ]
        );
    } else if (association.type === "remove") {
        await db.run(
            `
            DELETE FROM label_associations 
            WHERE type = ? AND chatId = ? AND messageId = ? AND labelId = ?
        `,
            [
                association.association.type,
                association.association.chatId,
                association.association.type === LabelAssociationType.Message ? (association.association as MessageLabelAssociation).messageId : null,
                association.association.labelId,
            ]
        );
    }
}

// 1. Load a specific message by ID
export async function loadMessage(id: string): Promise<any> {
    const db: Database = await getDb();
    const message = await db.get(
        `
        SELECT data 
        FROM messages 
        WHERE id = ?
        `,
        [id]
    );
    return message ? JSON.parse(message.data) : null;
}

export async function fetchParticipantsActivity(jid: string, endDate?: number): Promise<ParticipantActivity[]> {
    const db: Database = await getDb();

    const groupData: GroupMetadata | undefined = await groupMetadata(jid);

    if (!groupData || !groupData.participants) {
        return [];
    }

    const participantsMap: Map<string, GroupParticipant> = new Map();
    groupData.participants.forEach((participant) => {
        participantsMap.set(participant.id, participant);
    });

    let query: string = `
        SELECT data
        FROM messages 
        WHERE remoteJid = ?
    `;
    const params: (string | number)[] = [jid];

    if (endDate !== undefined) {
        query += " AND messageTimestamp <= ?";
        params.push(endDate);
    }

    const messages = await db.all(query, params);

    const activityMap: Map<string, number> = new Map();
    const pushNameMap: Map<string, string> = new Map();

    messages.forEach((msg) => {
        const messageData = JSON.parse(msg.data);
        const participant: string = messageData.key?.participant || messageData.participant;

        if (participant && participantsMap.has(participant)) {
            activityMap.set(participant, (activityMap.get(participant) || 0) + 1);
            if (messageData.pushName && !pushNameMap.has(participant)) {
                pushNameMap.set(participant, messageData.pushName);
            }
        }
    });

    const results: ParticipantActivity[] = Array.from(activityMap.entries()).map(([participant, messageCount]) => ({
        pushName: pushNameMap.get(participant) || null,
        messageCount,
        participant,
    }));

    results.sort((a, b) => b.messageCount - a.messageCount);

    return results;
}

export async function getChatSummary(jid: string): Promise<{
    totalMessages: number;
    lastMessageTimestamp: number | null;
    participantCount: number;
    mostActiveParticipant: string | null;
}> {
    const db: Database = await getDb();

    // Get total messages and last timestamp
    const chatStats = await db.get(
        `
        SELECT 
            COUNT(*) AS totalMessages,
            MAX(messageTimestamp) AS lastMessageTimestamp
        FROM messages 
        WHERE remoteJid = ?
        `,
        [jid]
    );

    // Get participant count
    const participantCount = await db.get(
        `
        SELECT COUNT(DISTINCT participant) AS count
        FROM messages 
        WHERE remoteJid = ?
        `,
        [jid]
    );

    // Get most active participant
    const mostActive = await db.get(
        `
        SELECT participant
        FROM messages 
        WHERE remoteJid = ?
        GROUP BY participant
        ORDER BY COUNT(*) DESC
        LIMIT 1
        `,
        [jid]
    );

    return {
        totalMessages: chatStats?.totalMessages || 0,
        lastMessageTimestamp: chatStats?.lastMessageTimestamp || null,
        participantCount: participantCount?.count || 0,
        mostActiveParticipant: mostActive?.participant || null,
    };
}

export async function getAllMessagesFromChat(jid: string): Promise<any[]> {
    const db: Database = await getDb();
    const messages = await db.all(
        `
        SELECT data 
        FROM messages 
        WHERE remoteJid = ?
        ORDER BY messageTimestamp ASC
        `,
        [jid]
    );
    return messages.map((msg) => JSON.parse(msg.data));
}

// 5. Get message count by status (bonus function)
export async function getMessageStatusCount(jid: string): Promise<
    {
        status: string;
        count: number;
    }[]
> {
    const db: Database = await getDb();
    const results = await db.all(
        `
        SELECT 
            status,
            COUNT(*) AS count
        FROM messages 
        WHERE remoteJid = ?
        GROUP BY status
        `,
        [jid]
    );
    return results;
}
