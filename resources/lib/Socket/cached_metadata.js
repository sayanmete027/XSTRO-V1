"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGroupMetadata = exports.groupMetadata = exports.saveGroupMetadata = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const database = (0, sqlite_1.open)({
    filename: 'database.db',
    driver: sqlite3_1.default.Database,
});
const initDb = async () => {
    const db = await database;
    await db.exec(`
    CREATE TABLE IF NOT EXISTS group_metadata (
      jid TEXT PRIMARY KEY,
      metadata JSON
    );
  `);
    return db;
};
const saveGroupMetadata = async (jid, metadata) => {
    const db = await initDb();
    const jsonMetadata = JSON.stringify(metadata);
    const query = `
    INSERT INTO group_metadata (jid, metadata)
    VALUES (?, ?)
    ON CONFLICT(jid) DO UPDATE SET metadata = excluded.metadata;
  `;
    await db.run(query, [jid, jsonMetadata]);
};
exports.saveGroupMetadata = saveGroupMetadata;
const groupMetadata = async (jid) => {
    const db = await initDb();
    const query = `
    SELECT metadata
    FROM group_metadata
    WHERE jid = ?;
  `;
    const result = await db.get(query, [jid]);
    return result ? JSON.parse(result.metadata) : null;
};
exports.groupMetadata = groupMetadata;
const deleteGroupMetadata = async (jid) => {
    const db = await initDb();
    const query = `
    DELETE FROM group_metadata
    WHERE jid = ?;
  `;
    await db.run(query, [jid]);
};
exports.deleteGroupMetadata = deleteGroupMetadata;
