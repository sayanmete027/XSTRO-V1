import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDB = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS autokick (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      groupJid TEXT NOT NULL,
      userJid TEXT NOT NULL,
      UNIQUE(groupJid, userJid)
    )
  `);
};

export const addAKick = async (groupJid, userJid) => {
  await initDB();
  const db = await database;
  try {
    await db.run(`INSERT INTO autokick (groupJid, userJid) VALUES (?, ?)`, [groupJid, userJid]);
    return true;
  } catch {
    return false;
  }
};

export const delKick = async (groupJid, userJid) => {
  await initDB();
  const db = await database;
  const { changes } = await db.run(`DELETE FROM autokick WHERE groupJid = ? AND userJid = ?`, [
    groupJid,
    userJid,
  ]);
  return changes > 0;
};

export const getKicks = async (groupJid, userJid = null) => {
  await initDB();
  const db = await database;
  return await db.all(
    `SELECT * FROM autokick WHERE groupJid = ? ${userJid ? 'AND userJid = ?' : ''}`,
    userJid ? [groupJid, userJid] : [groupJid]
  );
};
