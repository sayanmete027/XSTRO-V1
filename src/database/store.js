import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { isJidBroadcast, isJidGroup, isJidNewsletter, WAProto } from '#libary';
import { groupMetadata } from '#src';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
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
  return db;
};

export const saveContact = async (jid, name) => {
  if (!jid || !name || isJidGroup(jid) || isJidBroadcast(jid) || isJidNewsletter(jid)) return;
  const db = await initDb();
  await db.run(
    `INSERT INTO contacts (jid, name) VALUES (?, ?) ON CONFLICT(jid) DO UPDATE SET name = excluded.name`,
    [jid, name]
  );
};

export const getContacts = async () => {
  const db = await initDb();
  return db.all(`SELECT * FROM contacts`);
};

export const saveMessage = async (message) => {
  const { remoteJid: jid, id } = message.key;
  if (!id || !jid || !message) return;
  await saveContact(message.sender, message.pushName);
  const db = await initDb();
  const timestamp = message.messageTimestamp ? message.messageTimestamp * 1000 : Date.now();
  await db.run(
    `INSERT INTO messages (id, jid, message, timestamp) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET message = excluded.message, timestamp = excluded.timestamp`,
    [id, jid, JSON.stringify(message), timestamp]
  );
};

export const loadMessage = async (id) => {
  if (!id) return null;
  const db = await initDb();
  const result = await db.get(`SELECT message FROM messages WHERE id = ?`, [id]);
  return result ? JSON.parse(result.message) : null;
};

export const getMessage = async (id) => {
  if (!id) return null;
  const db = await initDb();
  const result = await db.get(`SELECT message FROM messages WHERE id = ?`, [id]);
  const message = result ? JSON.parse(result.message) : null;
  if (!message) return null;
  WAProto.Message.fromObject(message.message);
  const msg = WAProto.WebMessageInfo.fromObject(message);
  return msg;
};

export const getName = async (jid) => {
  if (isJidGroup(jid) || isJidBroadcast(jid) || isJidNewsletter(jid)) return null;
  const db = await initDb();
  const result = await db.get(`SELECT name FROM contacts WHERE jid = ?`, [jid]);
  return result ? result.name : null;
};

export const saveMessageCount = async (message) => {
  if (!message) return;
  const { remoteJid: jid } = message.key;
  const sender = message.sender;
  if (!jid || !sender || !isJidGroup(jid)) return;
  const db = await initDb();
  await db.run(
    `INSERT INTO message_counts (jid, sender, count) VALUES (?, ?, 1) ON CONFLICT(jid, sender) DO UPDATE SET count = count + 1`,
    [jid, sender]
  );
};

export const getInactiveGroupMembers = async (jid) => {
  if (!isJidGroup(jid)) return [];
  const groupdata = await groupMetadata(jid);
  if (!groupdata) return [];
  const db = await initDb();
  const messageCounts = await db.all(`SELECT sender FROM message_counts WHERE jid = ?`, [jid]);
  const inactiveMembers = groupdata.participants.filter(
    (p) => !messageCounts.some((m) => m.sender === p.id)
  );
  return inactiveMembers.map((m) => m.id);
};

export const getGroupMembersMessageCount = async (jid) => {
  if (!isJidGroup(jid)) return [];
  const db = await initDb();
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

export const getChatSummary = async () => {
  const db = await initDb();
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

export const saveMessages = async (message) => {
  return Promise.all([saveMessage(message), saveMessageCount(message)]);
};
