"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getChatSummary = exports.getGroupMembersMessageCount = exports.getInactiveGroupMembers = exports.getName = exports.loadMessage = exports.saveMessage = exports.getContacts = exports.saveContact = void 0;
const baileys_1 = require("baileys");
const index_1 = require("../../src/index");
const database_1 = require("./database");
async function initStoreDb() {
  const db = await (0, database_1.getDb)();
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
const saveContact = async (jid, name) => {
  if (!jid || !name || (0, baileys_1.isJidGroup)(jid) || (0, baileys_1.isJidBroadcast)(jid) || (0, baileys_1.isJidNewsletter)(jid)) return;
  const db = await (0, database_1.getDb)();
  await initStoreDb();
  await db.run(`INSERT INTO contacts (jid, name) VALUES (?, ?) ON CONFLICT(jid) DO UPDATE SET name = excluded.name`, [jid, name]);
};
exports.saveContact = saveContact;
const getContacts = async () => {
  const db = await (0, database_1.getDb)();
  await initStoreDb();
  return db.all(`SELECT * FROM contacts`);
};
exports.getContacts = getContacts;
const saveMessage = async message => {
  const {
    remoteJid: jid,
    id
  } = message.key;
  if (!id || !jid || !message) return;
  await (0, exports.saveContact)(message.sender, message.pushName);
  const db = await (0, database_1.getDb)();
  await initStoreDb();
  const timestamp = typeof message.messageTimestamp === 'number' ? message.messageTimestamp * 1000 : Date.now();
  await db.run(`INSERT INTO messages (id, jid, message, timestamp) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET message = excluded.message, timestamp = excluded.timestamp`, [id, jid, JSON.stringify(message), timestamp]);
  if (message?.sender && (0, baileys_1.isJidGroup)(jid)) {
    await db.run(`INSERT INTO message_counts (jid, sender, count) VALUES (?, ?, 1) ON CONFLICT(jid, sender) DO UPDATE SET count = count + 1`, [jid, message.sender]);
  }
};
exports.saveMessage = saveMessage;
const loadMessage = async id => {
  if (!id) return null;
  const db = await (0, database_1.getDb)();
  await initStoreDb();
  const result = await db.get(`SELECT message FROM messages WHERE id = ?`, [id]);
  return result ? JSON.parse(result.message) : null;
};
exports.loadMessage = loadMessage;
const getName = async jid => {
  if ((0, baileys_1.isJidGroup)(jid) || (0, baileys_1.isJidBroadcast)(jid) || (0, baileys_1.isJidNewsletter)(jid)) return null;
  const db = await (0, database_1.getDb)();
  await initStoreDb();
  const result = await db.get(`SELECT name FROM contacts WHERE jid = ?`, [jid]);
  return result ? result.name : null;
};
exports.getName = getName;
const getInactiveGroupMembers = async jid => {
  if (!(0, baileys_1.isJidGroup)(jid)) return [];
  const groupdata = await (0, index_1.groupMetadata)(jid);
  if (!groupdata) return [];
  const db = await (0, database_1.getDb)();
  await initStoreDb();
  const messageCounts = await db.all(`SELECT sender FROM message_counts WHERE jid = ?`, [jid]);
  const inactiveMembers = groupdata.participants.filter(p => !messageCounts.some(m => m.sender === p.id));
  return inactiveMembers.map(m => m.id);
};
exports.getInactiveGroupMembers = getInactiveGroupMembers;
const getGroupMembersMessageCount = async jid => {
  if (!(0, baileys_1.isJidGroup)(jid)) return [];
  const db = await (0, database_1.getDb)();
  await initStoreDb();
  const groupCounts = await db.all(`SELECT sender, count FROM message_counts WHERE jid = ? ORDER BY count DESC`, [jid]);
  return Promise.all(groupCounts.map(async r => ({
    sender: r.sender,
    name: await (0, exports.getName)(r.sender),
    messageCount: r.count
  })));
};
exports.getGroupMembersMessageCount = getGroupMembersMessageCount;
const getChatSummary = async () => {
  const db = await (0, database_1.getDb)();
  await initStoreDb();
  const messages = await db.all(`SELECT jid, COUNT(*) as messageCount, MAX(timestamp) as lastMessageTimestamp FROM messages GROUP BY jid ORDER BY lastMessageTimestamp DESC`);
  return Promise.all(messages.map(async m => ({
    jid: m.jid,
    name: await (0, exports.getName)(m.jid),
    messageCount: m.messageCount,
    lastMessageTimestamp: m.lastMessageTimestamp
  })));
};
exports.getChatSummary = getChatSummary;