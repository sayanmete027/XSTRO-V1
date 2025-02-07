import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS antilink (
      jid TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      action TEXT NOT NULL,
      warningCount INTEGER DEFAULT 0
    )
  `);
  return db;
};

export async function setAntilink(jid, type, action) {
  const db = await initDb();
  const existing = await db.get(`SELECT * FROM antilink WHERE jid = ? AND type = ?`, [jid, type]);

  if (existing?.action === action) return false;

  if (existing) {
    await db.run(`UPDATE antilink SET action = ? WHERE jid = ? AND type = ?`, [action, jid, type]);
  } else {
    await db.run(`INSERT INTO antilink (jid, type, action) VALUES (?, ?, ?)`, [jid, type, action]);
  }
  return true;
}

export async function getAntilink(jid, type) {
  const db = await initDb();
  return await db.get(`SELECT action, warningCount FROM antilink WHERE jid = ? AND type = ?`, [
    jid,
    type,
  ]);
}

export async function removeAntilink(jid, type) {
  const db = await initDb();
  const { changes } = await db.run(`DELETE FROM antilink WHERE jid = ? AND type = ?`, [jid, type]);
  return changes;
}

export async function saveWarningCount(jid, type, count) {
  const db = await initDb();
  await db.run(`UPDATE antilink SET warningCount = ? WHERE jid = ? AND type = ?`, [
    count,
    jid,
    type,
  ]);
}

export async function incrementWarningCount(jid, type) {
  const db = await initDb();
  const existing = await db.get(`SELECT warningCount FROM antilink WHERE jid = ? AND type = ?`, [
    jid,
    type,
  ]);
  const newCount = (existing?.warningCount || 0) + 1;
  await saveWarningCount(jid, type, newCount);
  return newCount;
}

export async function resetWarningCount(jid, type) {
  await saveWarningCount(jid, type, 0);
}
