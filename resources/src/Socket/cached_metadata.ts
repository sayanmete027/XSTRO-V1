import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { GroupMetadata } from '../Types';


interface MetadataQueryResult {
  metadata: string;
}

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async (): Promise<Database> => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS group_metadata (
      jid TEXT PRIMARY KEY,
      metadata JSON
    );
  `);
  return db;
};

export const saveGroupMetadata = async (jid: string, metadata: GroupMetadata): Promise<void> => {
  const db = await initDb();
  const jsonMetadata = JSON.stringify(metadata);
  const query = `
    INSERT INTO group_metadata (jid, metadata)
    VALUES (?, ?)
    ON CONFLICT(jid) DO UPDATE SET metadata = excluded.metadata;
  `;
  await db.run(query, [jid, jsonMetadata]);
};

export const groupMetadata2 = async (jid: string): Promise<GroupMetadata | null> => {
  const db = await initDb();
  const query = `
    SELECT metadata
    FROM group_metadata
    WHERE jid = ?;
  `;
  const result = await db.get<MetadataQueryResult>(query, [jid]);
  return result ? JSON.parse(result.metadata) : null;
};

export const deleteGroupMetadata = async (jid: string): Promise<void> => {
  const db = await initDb();
  const query = `
    DELETE FROM group_metadata
    WHERE jid = ?;
  `;
  await db.run(query, [jid]);
};