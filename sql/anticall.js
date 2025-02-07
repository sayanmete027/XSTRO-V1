import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS anticall (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      status TEXT NOT NULL DEFAULT 'off',
      action TEXT NOT NULL DEFAULT 'reject'
    )
  `);
  await db.run(`INSERT OR IGNORE INTO anticall (id, status, action) VALUES (1, 'off', 'reject')`);
  return db;
};

async function setAntiCall(status, action) {
  const db = await initDb();
  await db.run(
    `UPDATE anticall SET status = COALESCE(?, status), action = COALESCE(?, action) WHERE id = 1`,
    [status, action]
  );
  return true;
}

async function getAntiCall() {
  const db = await initDb();
  return await db.get(`SELECT status, action FROM anticall WHERE id = 1`);
}

export { setAntiCall, getAntiCall };
