import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS mentions (
      jid TEXT PRIMARY KEY,
      message TEXT NOT NULL
    );
  `);
  return db;
};

export const setMention = async (jid, message) => {
  const db = await initDb();
  await db.run(
    `INSERT INTO mentions (jid, message) VALUES (?, ?) 
     ON CONFLICT(jid) DO UPDATE SET message = excluded.message`,
    [jid, JSON.stringify(message)]
  );
  return true;
};

export const delMention = async (jid) => {
  const db = await initDb();
  const result = await db.run(`DELETE FROM mentions WHERE jid = ?`, [jid]);
  return result.changes > 0;
};

export const isMention = async (jid) => {
  const db = await initDb();
  const data = await db.get(`SELECT 1 FROM mentions WHERE jid = ?`, [jid]);
  return !!data;
};

export const getMention = async (jid) => {
  const db = await initDb();
  const data = await db.get(`SELECT message FROM mentions WHERE jid = ?`, [jid]);
  return data ? JSON.parse(data.message) : null;
};
