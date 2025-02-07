import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS antiword (
      jid TEXT PRIMARY KEY,
      status INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS antiwords (
      jid TEXT NOT NULL,
      word TEXT NOT NULL,
      PRIMARY KEY (jid, word),
      FOREIGN KEY (jid) REFERENCES antiword(jid) ON DELETE CASCADE
    );
  `);
  return db;
};

export async function setAntiWordStatus(jid, action) {
  const db = await initDb();
  await db.run(
    `INSERT INTO antiword (jid, status) VALUES (?, ?) 
    ON CONFLICT(jid) DO UPDATE SET status = excluded.status`,
    [jid, action ? 1 : 0]
  );
  return { success: true, message: `Antiword ${action ? 'enabled' : 'disabled'} for group ${jid}` };
}

export async function addAntiWords(jid, words) {
  const db = await initDb();
  const insertStmt = await db.prepare(`INSERT OR IGNORE INTO antiwords (jid, word) VALUES (?, ?)`);

  for (const word of words) {
    await insertStmt.run(jid, word);
  }
  await insertStmt.finalize();

  return {
    success: true,
    message: `Added ${words.length} antiwords to group ${jid}`,
    addedWords: words,
  };
}

export async function removeAntiWords(jid, words) {
  const db = await initDb();
  const deleteStmt = await db.prepare(`DELETE FROM antiwords WHERE jid = ? AND word = ?`);

  for (const word of words) {
    await deleteStmt.run(jid, word);
  }
  await deleteStmt.finalize();

  return {
    success: true,
    message: `Removed ${words.length} antiwords from group ${jid}`,
    removedWords: words,
  };
}

export async function getAntiWords(jid) {
  const db = await initDb();
  const record = await db.get(`SELECT status FROM antiword WHERE jid = ?`, [jid]);
  const words = await db.all(`SELECT word FROM antiwords WHERE jid = ?`, [jid]);

  return {
    success: true,
    status: record ? !!record.status : false,
    words: words.map((row) => row.word),
  };
}

export async function isAntiWordEnabled(jid) {
  const db = await initDb();
  const record = await db.get(`SELECT status FROM antiword WHERE jid = ?`, [jid]);
  return record ? !!record.status : false;
}
