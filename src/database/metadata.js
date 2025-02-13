import { getDb } from './database.js';

async function initMetadataDb() {
  const db = await getDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS group_metadata (
      jid TEXT PRIMARY KEY,
      metadata JSON
    );
  `);
}

export const saveGroupMetadata = async (jid, metadata) => {
  const db = await getDb();
  await initMetadataDb();

  const jsonMetadata = JSON.stringify(metadata);
  const query = `
    INSERT INTO group_metadata (jid, metadata)
    VALUES (?, ?)
    ON CONFLICT(jid) DO UPDATE SET metadata = excluded.metadata;
  `;
  await db.run(query, [jid, jsonMetadata]);
};

export const groupMetadata = async (jid) => {
  const db = await getDb();
  await initMetadataDb();

  const query = `SELECT metadata FROM group_metadata WHERE jid = ?;`;
  const result = await db.get(query, [jid]);

  return result && result.metadata ? JSON.parse(result.metadata) : null;
};
