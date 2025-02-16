import { Database } from 'sqlite';
import { isJidBroadcast, isJidGroup, isJidNewsletter } from 'baileys';
import { groupMetadata } from '../../src/index.mjs';
import { getDb } from './database.mjs';
import { Message } from '../../types/index.mjs';

async function initStoreDb(): Promise<void> {
  const db: Database = await getDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      jid TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      jid TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (jid) REFERENCES contacts(jid) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS message_counts (
      jid TEXT NOT NULL,
      sender TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      PRIMARY KEY (jid, sender)
    );
  `);
}

export const saveContact = async (jid: string, name: string): Promise<void> => {
  if (!jid || !name || isJidGroup(jid) || isJidBroadcast(jid) || isJidNewsletter(jid)) return;
  const db: Database = await getDb();
  await initStoreDb();
  await db.run(
    `INSERT INTO contacts (jid, name) VALUES (?, ?) ON CONFLICT(jid) DO UPDATE SET name = excluded.name`,
    [jid, name]
  );
};

export const getContacts = async (): Promise<{ jid: string; name: string }[]> => {
  const db: Database = await getDb();
  await initStoreDb();
  return db.all(`SELECT * FROM contacts`);
};

class Mutex {
  private mutex = Promise.resolve();
  async lock(): Promise<() => void> {
    let release: () => void;
    const lockPromise = new Promise<void>((res) => (release = res));
    const previous = this.mutex;
    this.mutex = previous.then(() => lockPromise);
    await previous;
    return release!;
  }
}

const dbMutex = new Mutex();
const processingMessages = new Map<string, Promise<void>>();

export const saveMessage = async (message: Message): Promise<void> => {
  const m = Object.fromEntries(
    Object.entries(message).filter(([key]) => key !== 'client')
  );
  if (!m || !m.key) return;
  const { remoteJid: jid, id } = m.key;
  if (!id || !jid) return;
  if (processingMessages.has(id)) return processingMessages.get(id)!;
  const job = async () => {
    await saveContact(m.sender!, m.pushName!);
    const db: Database = await getDb();
    await initStoreDb();
    const timestamp =
      typeof m.messageTimestamp === 'number'
        ? m.messageTimestamp * 1000
        : Date.now();
    const unlock = await dbMutex.lock();
    try {
      await db.run(
        `INSERT INTO messages (id, jid, message, timestamp) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET message = excluded.message, timestamp = excluded.timestamp`,
        [id, jid, JSON.stringify(m), timestamp]
      );
      if (m?.sender && isJidGroup(jid)) {
        await db.run(
          `INSERT INTO message_counts (jid, sender, count) VALUES (?, ?, 1) ON CONFLICT(jid, sender) DO UPDATE SET count = count + 1`,
          [jid, m.sender]
        );
      }
    } finally {
      unlock();
    }
  };
  const promise = job();
  processingMessages.set(id, promise);
  try {
    await promise;
  } finally {
    processingMessages.delete(id);
  }
};


export const loadMessage = async (id: string): Promise<Message | null> => {
  if (!id) return null;
  const db: Database = await getDb();
  await initStoreDb();
  const result = await db.get(`SELECT message FROM messages WHERE id = ?`, [id]);
  return result ? JSON.parse(result.message) : null;
};

export const getName = async (jid: string): Promise<string | null> => {
  if (isJidGroup(jid) || isJidBroadcast(jid) || isJidNewsletter(jid)) return null;
  const db: Database = await getDb();
  await initStoreDb();
  const result = await db.get(`SELECT name FROM contacts WHERE jid = ?`, [jid]);
  return result ? result.name : null;
};

export const getInactiveGroupMembers = async (jid: string): Promise<string[]> => {
  if (!isJidGroup(jid)) return [];
  const groupdata = await groupMetadata(jid);
  if (!groupdata) return [];
  const db: Database = await getDb();
  await initStoreDb();
  const messageCounts = await db.all(`SELECT sender FROM message_counts WHERE jid = ?`, [jid]);
  const inactiveMembers = groupdata.participants.filter(
    (p) => !messageCounts.some((m) => m.sender === p.id)
  );
  return inactiveMembers.map((m) => m.id);
};

export const getGroupMembersMessageCount = async (jid: string): Promise<{ sender: string; name: string | null; messageCount: number }[]> => {
  if (!isJidGroup(jid)) return [];
  const db: Database = await getDb();
  await initStoreDb();
  const groupCounts = await db.all(
    `SELECT sender, count FROM message_counts WHERE jid = ? ORDER BY count DESC`,
    [jid]
  );
  return Promise.all(
    groupCounts.map(async (r) => ({
      sender: r.sender,
      name: await getName(r.sender),
      messageCount: r.count,
    }))
  );
};

export const getChatSummary = async (): Promise<{ jid: string; name: string | null; messageCount: number; lastMessageTimestamp: number }[]> => {
  const db: Database = await getDb();
  await initStoreDb();
  const messages = await db.all(
    `SELECT jid, COUNT(*) as messageCount, MAX(timestamp) as lastMessageTimestamp FROM messages GROUP BY jid ORDER BY lastMessageTimestamp DESC`
  );
  return Promise.all(
    messages.map(async (m) => ({
      jid: m.jid,
      name: await getName(m.jid),
      messageCount: m.messageCount,
      lastMessageTimestamp: m.lastMessageTimestamp,
    }))
  );
};