"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useSQLiteAuthState = void 0;
const sqlite3_1 = require("sqlite3");
const baileys_1 = require("baileys");
const useSQLiteAuthState = async database => {
  // Enhanced memory cache with size limit
  const cache = new Map();
  const MAX_CACHE_SIZE = 10000;
  const db = await new Promise((resolve, reject) => {
    const db = new sqlite3_1.Database(database, err => {
      if (err) return reject(err);
      // Enable WAL mode and optimize SQLite settings
      db.exec(`
                PRAGMA journal_mode = WAL;
                PRAGMA synchronous = NORMAL;
                PRAGMA temp_store = MEMORY;
                PRAGMA cache_size = -2000;
                PRAGMA mmap_size = 30000000000;
                CREATE TABLE IF NOT EXISTS session (
                    id TEXT PRIMARY KEY,
                    data TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_session_id ON session(id);
            `, err => err ? reject(err) : resolve(db));
    });
  });
  // Batch processing queue
  let writeQueue = [];
  let writeTimer = null;
  const BATCH_DELAY = 50; // ms
  const processBatchWrites = async () => {
    if (writeQueue.length === 0) return;
    const currentQueue = writeQueue;
    writeQueue = [];
    writeTimer = null;
    try {
      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
          const stmt = db.prepare('INSERT INTO session (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data');
          currentQueue.forEach(({
            id,
            data
          }) => {
            if (data !== null) {
              stmt.run(id, data);
            }
          });
          stmt.finalize();
          db.run('COMMIT', err => err ? reject(err) : resolve());
        });
      });
    } catch (error) {
      console.error('Batch write error:', error);
      // Re-queue failed writes
      writeQueue = [...currentQueue, ...writeQueue];
      scheduleBatchWrite();
    }
  };
  const scheduleBatchWrite = () => {
    if (!writeTimer && writeQueue.length > 0) {
      writeTimer = setTimeout(processBatchWrites, BATCH_DELAY);
    }
  };
  const readData = async (type, id) => {
    const sessionId = id ? `${type}:${id}` : type;
    // Check cache first
    if (cache.has(sessionId)) {
      return cache.get(sessionId);
    }
    return new Promise((resolve, reject) => {
      db.get('SELECT data FROM session WHERE id = ?', [sessionId], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        try {
          const data = JSON.parse(row.data, baileys_1.BufferJSON.reviver);
          // Update cache with size limit check
          if (cache.size >= MAX_CACHE_SIZE) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
          }
          cache.set(sessionId, data);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
    });
  };
  const writeData = async (type, id, data) => {
    const sessionId = id ? `${type}:${id}` : type;
    const serialized = JSON.stringify(data, baileys_1.BufferJSON.replacer);
    // Update cache immediately
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(sessionId, data);
    // Add to batch queue
    writeQueue.push({
      id: sessionId,
      data: serialized
    });
    scheduleBatchWrite();
  };
  const deleteData = async (type, id) => {
    const sessionId = `${type}:${id}`;
    cache.delete(sessionId);
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM session WHERE id = ?', [sessionId], err => err ? reject(err) : resolve());
    });
  };
  // Initialize credentials
  const credsData = await readData('creds');
  const creds = credsData || (0, baileys_1.initAuthCreds)();
  if (!credsData) {
    await writeData('creds', null, creds);
  }
  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const result = {};
          const uncachedIds = [];
          // Process cached items first
          for (const id of ids) {
            const sessionId = `${type}:${id}`;
            if (cache.has(sessionId)) {
              let data = cache.get(sessionId);
              if (type === 'app-state-sync-key') {
                data = baileys_1.proto.Message.AppStateSyncKeyData.fromObject(data);
              }
              result[id] = data;
            } else {
              uncachedIds.push(id);
            }
          }
          if (uncachedIds.length === 0) return result;
          // Batch fetch uncached items
          return new Promise((resolve, reject) => {
            const sessionIds = uncachedIds.map(id => `${type}:${id}`);
            const query = 'SELECT id, data FROM session WHERE id IN (' + sessionIds.map(() => '?').join(',') + ')';
            db.all(query, sessionIds, (err, rows) => {
              if (err) return reject(err);
              if (!rows) return resolve(result);
              rows.forEach(row => {
                try {
                  const originalId = row.id.split(':')[1];
                  let data = JSON.parse(row.data, baileys_1.BufferJSON.reviver);
                  if (type === 'app-state-sync-key') {
                    data = baileys_1.proto.Message.AppStateSyncKeyData.fromObject(data);
                  }
                  if (cache.size >= MAX_CACHE_SIZE) {
                    const firstKey = cache.keys().next().value;
                    cache.delete(firstKey);
                  }
                  cache.set(row.id, data);
                  result[originalId] = data;
                } catch (error) {
                  console.error('Parse error:', error);
                }
              });
              // Set null for missing IDs
              ids.forEach(id => {
                if (!(id in result)) {
                  result[id] = null;
                }
              });
              resolve(result);
            });
          });
        },
        set: async data => {
          const batchWrites = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const sessionId = `${category}:${id}`;
              if (value) {
                if (cache.size >= MAX_CACHE_SIZE) {
                  const firstKey = cache.keys().next().value;
                  cache.delete(firstKey);
                }
                cache.set(sessionId, value);
                batchWrites.push({
                  id: sessionId,
                  data: JSON.stringify(value, baileys_1.BufferJSON.replacer)
                });
              } else {
                cache.delete(sessionId);
                batchWrites.push({
                  id: sessionId,
                  data: null
                });
              }
            }
          }
          // Add all operations to batch queue
          writeQueue.push(...batchWrites);
          scheduleBatchWrite();
        }
      }
    },
    saveCreds: () => writeData('creds', null, creds)
  };
};
exports.useSQLiteAuthState = useSQLiteAuthState;