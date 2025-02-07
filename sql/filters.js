import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS filters (
      type TEXT NOT NULL,
      text TEXT NOT NULL,
      response TEXT NOT NULL,
      PRIMARY KEY (type, text)
    );
  `);
  return db;
};

export const addFilter = async (type, text, response) => {
  const db = await initDb();
  try {
    await db.run(`INSERT INTO filters (type, text, response) VALUES (?, ?, ?)`, [
      type,
      text,
      response,
    ]);
    return `${type.toUpperCase()} filter '${text}' added successfully.`;
  } catch {
    return `${type.toUpperCase()} filter '${text}' already exists.`;
  }
};

export const removeFilter = async (type, text) => {
  const db = await initDb();
  const result = await db.run(`DELETE FROM filters WHERE type = ? AND text = ?`, [type, text]);
  return result.changes > 0
    ? `${type.toUpperCase()} filter '${text}' removed successfully.`
    : `${type.toUpperCase()} filter '${text}' does not exist.`;
};

export const getFilters = async (type) => {
  const db = await initDb();
  return db.all(`SELECT text, response FROM filters WHERE type = ?`, [type]);
};
