"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setSessionId = exports.getSessionId = void 0;
const database_1 = require("./database");
async function initSessionDb() {
  const db = await (0, database_1.getDb)();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS session_id (
      id TEXT PRIMARY KEY
    );
  `);
}
const getSessionId = async () => {
  const db = await (0, database_1.getDb)();
  await initSessionDb();
  const row = await db.get('SELECT id FROM session_id LIMIT 1');
  return row ? row.id : null;
};
exports.getSessionId = getSessionId;
const setSessionId = async id => {
  const db = await (0, database_1.getDb)();
  await initSessionDb();
  await db.run('DELETE FROM session_id');
  await db.run('INSERT INTO session_id (id) VALUES (?)', id);
};
exports.setSessionId = setSessionId;