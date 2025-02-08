import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS group_events (
      jid TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL CHECK (enabled IN (0, 1))
    );
  `);
  return db;
};

export const enableGroupEvents = async (jid) => {
  const db = await initDb();
  await db.run(
    `INSERT INTO group_events (jid, enabled) VALUES (?, ?) 
     ON CONFLICT(jid) DO UPDATE SET enabled = excluded.enabled`,
    [jid, 1]
  );
  return true;
};

export const disableGroupEvents = async (jid) => {
  const db = await initDb();
  await db.run(
    `INSERT INTO group_events (jid, enabled) VALUES (?, ?) 
     ON CONFLICT(jid) DO UPDATE SET enabled = excluded.enabled`,
    [jid, 0]
  );
  return true;
};

export const isGroupEventEnabled = async (jid) => {
  const db = await initDb();
  const data = await db.get(`SELECT enabled FROM group_events WHERE jid = ?`, [jid]);
  return data ? !!data.enabled : false;
};
