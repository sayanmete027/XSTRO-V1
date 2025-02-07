import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`CREATE TABLE IF NOT EXISTS sudo_users (jid TEXT PRIMARY KEY)`);
  return db;
};

export const addSudo = async (jid = []) => {
  if (!Array.isArray(jid)) jid = [jid];
  const db = await initDb();
  let added = false;

  await db.run('BEGIN TRANSACTION');
  for (const id of jid) {
    try {
      await db.run(`INSERT INTO sudo_users (jid) VALUES (?) ON CONFLICT(jid) DO NOTHING`, [id]);
      added = true;
    } catch {}
  }
  await db.run('COMMIT');
  return added;
};

export const delSudo = async (jid = []) => {
  if (!Array.isArray(jid)) jid = [jid];
  const db = await initDb();
  let removed = false;

  await db.run('BEGIN TRANSACTION');
  for (const id of jid) {
    const result = await db.run(`DELETE FROM sudo_users WHERE jid = ?`, [id]);
    if (result.changes > 0) removed = true;
  }
  await db.run('COMMIT');
  return removed;
};

export const getSudo = async () => {
  const db = await initDb();
  const users = await db.all(`SELECT jid FROM sudo_users`);
  return users.length > 0 ? users.map((u) => u.jid) : false;
};

export const isSudo = async (jid = []) => {
  if (!Array.isArray(jid)) jid = [jid];
  const db = await initDb();
  const users = await db.all(
    `SELECT jid FROM sudo_users WHERE jid IN (${jid.map(() => '?').join(',')})`,
    jid
  );
  return users.length > 0;
};
