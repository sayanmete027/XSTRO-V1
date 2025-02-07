import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS afk_message (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      message TEXT,
      timestamp INTEGER
    )
  `);
  return db;
};

export async function getAfkMessage() {
  const db = await initDb();
  const row = await db.get('SELECT message, timestamp FROM afk_message WHERE id = 1');
  return row ?? null;
}

export const setAfkMessage = async (afkMessage, timestamp) => {
  const db = await initDb();
  await db.run(
    `INSERT INTO afk_message (id, message, timestamp) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET message = excluded.message, timestamp = excluded.timestamp`,
    [afkMessage, timestamp]
  );
  return { message: afkMessage, timestamp };
};

export const delAfkMessage = async () => {
  const db = await initDb();
  await db.run('DELETE FROM afk_message WHERE id = 1');
  return { message: null, timestamp: null };
};
