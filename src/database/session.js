import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS session_id (
      id TEXT PRIMARY KEY
    );
  `);
  return db;
};

export const getSessionId = async () => {
  await initDb();
  const db = await database;
  const row = await db.get('SELECT id FROM session_id LIMIT 1');
  return row ? row.id : null;
};

export const setSessionId = async (id) => {
  await initDb();
  const db = await database;
  await db.run('DELETE FROM session_id');
  await db.run('INSERT INTO session_id (id) VALUES (?)', id);
};
