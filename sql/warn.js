import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(
    `CREATE TABLE IF NOT EXISTS warnings (jid TEXT PRIMARY KEY, warnings INTEGER DEFAULT 0)`
  );
  return db;
};

export const addWarn = async (jid) => {
  const db = await initDb();
  await db.run(
    `INSERT INTO warnings (jid, warnings) VALUES (?, 1) ON CONFLICT(jid) DO UPDATE SET warnings = warnings + 1`,
    [jid]
  );
  const { warnings } = await db.get(`SELECT warnings FROM warnings WHERE jid = ?`, [jid]);
  return { success: true, warnings };
};

export const getWarn = async (jid) => {
  const db = await initDb();
  const user = await db.get(`SELECT warnings FROM warnings WHERE jid = ?`, [jid]);
  return { success: true, warnings: user ? user.warnings : 0 };
};

export const resetWarn = async (jid) => {
  const db = await initDb();
  await db.run(`UPDATE warnings SET warnings = 0 WHERE jid = ?`, [jid]);
  return { success: true };
};

export const isWarned = async (jid) => {
  const db = await initDb();
  const user = await db.get(`SELECT warnings FROM warnings WHERE jid = ?`, [jid]);
  return user ? user.warnings > 0 : false;
};
