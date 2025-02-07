import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDB = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS antibot (
      jid TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL
    )
  `);
};

async function setAntibot(jid, enabled) {
  await initDB();
  const db = await database;
  await db.run(
    `INSERT INTO antibot (jid, enabled) VALUES (?, ?) 
     ON CONFLICT(jid) DO UPDATE SET enabled = excluded.enabled`,
    [jid, enabled ? 1 : 0]
  );
  return { jid, enabled };
}

async function delAntibot(jid) {
  await initDB();
  const db = await database;
  const { changes } = await db.run(`DELETE FROM antibot WHERE jid = ?`, [jid]);
  return changes > 0;
}

async function getAntibot(jid) {
  await initDB();
  const db = await database;
  const record = await db.get(`SELECT enabled FROM antibot WHERE jid = ?`, [jid]);
  return record ? !!record.enabled : false;
}

export { setAntibot, delAntibot, getAntibot };
