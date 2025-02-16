"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SessionMigrator = SessionMigrator;
const sqlite3_1 = __importDefault(require("sqlite3"));
const index_1 = require("../../src/index");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../../config"));
async function SessionMigrator(Sessionfolder, SessionDataBasePath) {
  try {
    const sId = await (0, index_1.getSessionId)();
    if (!Sessionfolder || !SessionDataBasePath || sId === config_1.default.SESSION_ID) {
      console.log('No Migration');
      return;
    }
    async function readSessionFiles() {
      const files = await promises_1.default.readdir(Sessionfolder);
      const result = {};
      const syncKeyFiles = files.filter(file => file.startsWith('app-state-sync-key-'));
      await Promise.all(syncKeyFiles.map(async file => {
        let dynamicPart = file.substring('app-state-sync-key-'.length);
        if (dynamicPart.endsWith('.json')) dynamicPart = dynamicPart.slice(0, -5);
        const newKey = `app-state-sync-key:${dynamicPart}`;
        const content = await promises_1.default.readFile(path_1.default.join(Sessionfolder, file), 'utf8');
        try {
          result[newKey] = JSON.parse(content);
        } catch {
          result[newKey] = content;
        }
      }));
      if (files.includes('creds.json')) {
        const content = await promises_1.default.readFile(path_1.default.join(Sessionfolder, 'creds.json'), 'utf8');
        try {
          result['creds'] = JSON.parse(content);
        } catch {
          result['creds'] = content;
        }
      }
      return result;
    }
    const sessionData = await readSessionFiles();
    const db = await openDatabase(SessionDataBasePath);
    await ensureSessionTable(db);
    if (sessionData.creds) {
      const credsValue = typeof sessionData.creds === 'object' ? JSON.stringify(sessionData.creds) : sessionData.creds;
      await runQuery(db, 'DELETE FROM session WHERE id = ?', ['creds']);
      const firstRow = await getFirstRow(db);
      if (firstRow) {
        await runQuery(db, 'UPDATE session SET id = ?, data = ? WHERE rowid = ?', ['creds', credsValue, firstRow.rowid]);
      } else {
        await runQuery(db, 'INSERT INTO session (id, data) VALUES (?, ?)', ['creds', credsValue]);
      }
    }
    for (const key of Object.keys(sessionData)) {
      if (key === 'creds') continue;
      const value = typeof sessionData[key] === 'object' ? JSON.stringify(sessionData[key]) : sessionData[key];
      await runQuery(db, 'REPLACE INTO session (id, data) VALUES (?, ?)', [key, value]);
    }
    await closeDatabase(db);
    await (0, index_1.setSessionId)(config_1.default.SESSION_ID);
    return sessionData;
  } catch {
    console.log('No Migration');
    return;
  }
}
function openDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3_1.default.Database(dbPath, sqlite3_1.default.OPEN_READWRITE, err => {
      if (err) reject(err);else resolve(db);
    });
  });
}
function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);else resolve(this);
    });
  });
}
function closeDatabase(db) {
  return new Promise((resolve, reject) => {
    db.close(err => {
      if (err) reject(err);else resolve();
    });
  });
}
function ensureSessionTable(db) {
  return runQuery(db, 'CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY, data TEXT)');
}
function getFirstRow(db) {
  return new Promise((resolve, reject) => {
    db.get('SELECT rowid FROM session ORDER BY rowid ASC LIMIT 1', (err, row) => {
      if (err) reject(err);else resolve(row);
    });
  });
}