import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS banned_users (
      jid TEXT PRIMARY KEY
    );
  `);
  return db;
};

export const addBan = async (jid) => {
  if (!jid) throw new Error('JID is required.');

  const db = await initDb();
  try {
    await db.run(`INSERT INTO banned_users (jid) VALUES (?)`, [jid]);
    return `_@${jid.split('@')[0]} has been banned from using commands._`;
  } catch {
    return `_@${jid.split('@')[0]} is already banned._`;
  }
};

export const removeBan = async (jid) => {
  if (!jid) throw new Error('JID is required.');

  const db = await initDb();
  const result = await db.run(`DELETE FROM banned_users WHERE jid = ?`, [jid]);
  return result.changes
    ? `_@${jid.split('@')[0]} unbanned, and can now use commands._`
    : `_@${jid.split('@')[0]} wasn't banned._`;
};

export const getBanned = async () => {
  const db = await initDb();
  const bannedUsers = await db.all(`SELECT jid FROM banned_users`);
  return bannedUsers.map((row) => row.jid);
};

export const isBanned = async (jid) => {
  if (!jid) return false;
  const db = await initDb();
  const result = await db.get(`SELECT jid FROM banned_users WHERE jid = ?`, [jid]);
  return !!result;
};
