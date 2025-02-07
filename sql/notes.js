import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
  return db;
};

export const addNote = async (title, content) => {
  const db = await initDb();
  const result = await db.run(`INSERT INTO notes (title, content, createdAt) VALUES (?, ?, ?)`, [
    title,
    content,
    new Date().toISOString(),
  ]);
  return { id: result.lastID, title, content, createdAt: new Date().toISOString() };
};

export const updateNote = async (id, updates) => {
  const db = await initDb();
  const existingNote = await db.get(`SELECT * FROM notes WHERE id = ?`, [id]);

  if (!existingNote) throw new Error('Note not found');

  const updatedNote = {
    title: updates.title || existingNote.title,
    content: updates.content || existingNote.content,
    createdAt: existingNote.createdAt,
  };

  await db.run(`UPDATE notes SET title = ?, content = ? WHERE id = ?`, [
    updatedNote.title,
    updatedNote.content,
    id,
  ]);

  return { id, ...updatedNote };
};

export const removeNote = async (id) => {
  const db = await initDb();
  const result = await db.run(`DELETE FROM notes WHERE id = ?`, [id]);
  return result.changes > 0;
};

export const getNotes = async () => {
  const db = await initDb();
  return db.all(`SELECT * FROM notes`);
};

export const getNote = async (id) => {
  const db = await initDb();
  return db.get(`SELECT * FROM notes WHERE id = ?`, [id]);
};
