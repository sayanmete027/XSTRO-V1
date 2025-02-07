import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { isJidGroup } from '#libary';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS antispam (
      jid TEXT PRIMARY KEY,
      mode TEXT NOT NULL
    )
  `);
  return db;
};

export async function setAntiSpam(jid, mode) {
  const db = await initDb();
  const normalizedJid = isJidGroup(jid) ? jid : 'global';
  const existing = await db.get(`SELECT * FROM antispam WHERE jid = ?`, [normalizedJid]);

  if (existing) {
    await db.run(`UPDATE antispam SET mode = ? WHERE jid = ?`, [mode, normalizedJid]);
  } else {
    await db.run(`INSERT INTO antispam (jid, mode) VALUES (?, ?)`, [normalizedJid, mode]);
  }
  return true;
}

export async function getAntiSpamMode(jid) {
  const db = await initDb();
  const normalizedJid = isJidGroup(jid) ? jid : 'global';
  const result = await db.get(`SELECT mode FROM antispam WHERE jid = ?`, [normalizedJid]);
  return result ? result.mode : 'off';
}
