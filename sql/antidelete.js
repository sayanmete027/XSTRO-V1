import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS antidelete (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      status INTEGER NOT NULL DEFAULT 0
    )
  `);
  await db.run(`INSERT OR IGNORE INTO antidelete (id, status) VALUES (1, 0)`);
  return db;
};

export async function setAntiDelete(status) {
  if (typeof status !== 'boolean') {
    throw new Error('Status must be a boolean.');
  }
  const db = await initDb();
  await db.run(`UPDATE antidelete SET status = ? WHERE id = 1`, [status ? 1 : 0]);
}

export async function getAntiDelete() {
  const db = await initDb();
  const row = await db.get(`SELECT status FROM antidelete WHERE id = 1`);
  return !!row?.status;
}
