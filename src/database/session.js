import { getDb } from './database.js';

async function initSessionDb() {
  const db = await getDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS session_id (
      id TEXT PRIMARY KEY
    );
  `);
}

export const getSessionId = async () => {
  const db = await getDb();
  await initSessionDb();
  const row = await db.get('SELECT id FROM session_id LIMIT 1');
  return row ? row.id : null;
};

export const setSessionId = async (id) => {
  const db = await getDb();
  await initSessionDb();
  await db.run('DELETE FROM session_id');
  await db.run('INSERT INTO session_id (id) VALUES (?)', id);
};
