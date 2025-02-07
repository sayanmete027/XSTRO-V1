import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS autoreact (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      status INTEGER NOT NULL DEFAULT 0
    );
    INSERT INTO autoreact (id, status)
    SELECT 1, 0 WHERE NOT EXISTS (SELECT 1 FROM autoreact WHERE id = 1);
  `);
  return db;
};

export async function setAutoReactStatus(status) {
  const db = await initDb();
  await db.run(`UPDATE autoreact SET status = ? WHERE id = 1`, [status ? 1 : 0]);
  return true;
}

export async function getAutoReactStatus() {
  const db = await initDb();
  const record = await db.get(`SELECT status FROM autoreact WHERE id = 1`);
  return record ? !!record.status : false;
}
