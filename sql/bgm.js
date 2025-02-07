import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS bgm (
      word TEXT PRIMARY KEY,
      response TEXT NOT NULL
    );
  `);
  return db;
};

export const addBgm = async (word, response) => {
  if (!word || !response) throw new Error('Both word and response are required');

  const db = await initDb();
  try {
    await db.run(`INSERT INTO bgm (word, response) VALUES (?, ?)`, [word.toLowerCase(), response]);
    return { word: word.toLowerCase(), response };
  } catch {
    throw new Error(`BGM entry for word "${word}" already exists`);
  }
};

export const getBgmResponse = async (word) => {
  if (!word) throw new Error('Word parameter is required');

  const db = await initDb();
  const result = await db.get(`SELECT response FROM bgm WHERE word = ?`, [word.toLowerCase()]);
  return result ? result.response : null;
};

export const deleteBgm = async (word) => {
  if (!word) throw new Error('Word parameter is required');

  const db = await initDb();
  const result = await db.run(`DELETE FROM bgm WHERE word = ?`, [word.toLowerCase()]);
  return result.changes > 0;
};

export const getBgmList = async () => {
  const db = await initDb();
  return db.all(`SELECT word, response FROM bgm ORDER BY word ASC`);
};
