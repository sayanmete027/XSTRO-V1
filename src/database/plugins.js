import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS plugins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      url TEXT NOT NULL
    );
  `);
  return db;
};

export const addPlugin = async (name, url) => {
  const db = await initDb();
  const existingPlugin = await db.get(`SELECT * FROM plugins WHERE name = ?`, [name]);

  if (existingPlugin) throw new Error('Plugin already exists');

  const result = await db.run(`INSERT INTO plugins (name, url) VALUES (?, ?)`, [name, url]);
  return { id: result.lastID, name, url };
};

export const updatePlugin = async (name, updates) => {
  const db = await initDb();
  const existingPlugin = await db.get(`SELECT * FROM plugins WHERE name = ?`, [name]);

  if (!existingPlugin) throw new Error('Plugin not found');

  const updatedPlugin = {
    name: updates.name || existingPlugin.name,
    url: updates.url || existingPlugin.url,
  };

  await db.run(`UPDATE plugins SET name = ?, url = ? WHERE name = ?`, [
    updatedPlugin.name,
    updatedPlugin.url,
    name,
  ]);

  return { id: existingPlugin.id, ...updatedPlugin };
};

export const removePlugin = async (name) => {
  const db = await initDb();
  const result = await db.run(`DELETE FROM plugins WHERE name = ?`, [name]);
  return result.changes > 0;
};

export const getPlugins = async () => {
  const db = await initDb();
  return db.all(`SELECT * FROM plugins`);
};
