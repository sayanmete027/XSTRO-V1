"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSQLiteAuthState = void 0;
const sqlite3_1 = require("sqlite3");
const WAProto_1 = require("../../WAProto");
const auth_utils_1 = require("./auth-utils");
const generics_1 = require("./generics");
const useSQLiteAuthState = async (dbPath) => {
    // In-memory cache for faster reads and writes
    const cache = new Map();
    const db = await new Promise((resolve, reject) => {
        const db = new sqlite3_1.Database(dbPath, (err) => {
            err ? reject(err) : resolve(db);
        });
    });
    // Initialize database schema
    await new Promise((resolve, reject) => {
        db.exec(`
            CREATE TABLE IF NOT EXISTS session (
                id TEXT PRIMARY KEY,
                data TEXT
            );
        `, (err) => (err ? reject(err) : resolve()));
    });
    const readData = async (type, id) => {
        const sessionId = id ? `${type}:${id}` : type;
        if (cache.has(sessionId)) {
            return cache.get(sessionId);
        }
        return new Promise((resolve, reject) => {
            db.get('SELECT data FROM session WHERE id = ?', [sessionId], (err, row) => {
                if (err)
                    return reject(err);
                if (!row)
                    return resolve(null);
                try {
                    const data = JSON.parse(row.data, generics_1.BufferJSON.reviver);
                    // Update cache
                    cache.set(sessionId, data);
                    resolve(data);
                }
                catch (parseError) {
                    reject(parseError);
                }
            });
        });
    };
    const writeData = async (type, id, data) => {
        const sessionId = id ? `${type}:${id}` : type;
        // Update cache immediately
        cache.set(sessionId, data);
        return new Promise((resolve, reject) => {
            const serialized = JSON.stringify(data, generics_1.BufferJSON.replacer);
            db.run('INSERT INTO session (id, data) VALUES (?, ?) ' +
                'ON CONFLICT(id) DO UPDATE SET data = excluded.data', [sessionId, serialized], (err) => (err ? reject(err) : resolve()));
        });
    };
    const deleteData = async (type, id) => {
        const sessionId = `${type}:${id}`;
        // Remove from cache
        cache.delete(sessionId);
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM session WHERE id = ?', [sessionId], (err) => (err ? reject(err) : resolve()));
        });
    };
    // Initialize or load credentials
    const credsData = await readData('creds');
    const creds = credsData || (0, auth_utils_1.initAuthCreds)();
    if (!credsData) {
        await writeData('creds', null, creds);
    }
    // Batch write queue for optimizing multiple writes
    let writeQueue = [];
    let writeTimeout = null;
    const processBatchWrites = () => {
        if (writeQueue.length === 0)
            return;
        const currentQueue = [...writeQueue];
        writeQueue = [];
        writeTimeout = null;
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            currentQueue.forEach(({ sessionId, data }) => {
                const serialized = JSON.stringify(data, generics_1.BufferJSON.replacer);
                db.run('INSERT INTO session (id, data) VALUES (?, ?) ' +
                    'ON CONFLICT(id) DO UPDATE SET data = excluded.data', [sessionId, serialized]);
            });
            db.run('COMMIT');
        });
    };
    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const result = {};
                    // Check cache first for all IDs
                    ids.forEach(id => {
                        const sessionId = `${type}:${id}`;
                        if (cache.has(sessionId)) {
                            let data = cache.get(sessionId);
                            if (type === 'app-state-sync-key') {
                                data = WAProto_1.proto.Message.AppStateSyncKeyData.fromObject(data);
                            }
                            result[id] = data;
                        }
                    });
                    // Get remaining IDs from database
                    const uncachedIds = ids.filter(id => !(`${type}:${id}` in cache));
                    if (uncachedIds.length === 0) {
                        return result;
                    }
                    return new Promise((resolve, reject) => {
                        const sessionIds = uncachedIds.map(id => `${type}:${id}`);
                        db.all('SELECT id, data FROM session WHERE id IN (' + sessionIds.map(() => '?').join(',') + ')', sessionIds, (err, rows) => {
                            if (err)
                                return reject(err);
                            rows.forEach(row => {
                                try {
                                    const originalId = row.id.split(':')[1];
                                    let data = JSON.parse(row.data, generics_1.BufferJSON.reviver);
                                    if (type === 'app-state-sync-key') {
                                        data = WAProto_1.proto.Message.AppStateSyncKeyData.fromObject(data);
                                    }
                                    // Update cache
                                    cache.set(row.id, data);
                                    result[originalId] = data;
                                }
                                catch (parseError) {
                                    reject(parseError);
                                }
                            });
                            ids.forEach(id => {
                                if (!(id in result)) {
                                    result[id] = null;
                                }
                            });
                            resolve(result);
                        });
                    });
                },
                set: async (data) => {
                    // Update cache immediately
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const sessionId = `${category}:${id}`;
                            if (value) {
                                cache.set(sessionId, value);
                                writeQueue.push({ sessionId, data: value });
                            }
                            else {
                                cache.delete(sessionId);
                                writeQueue.push({ sessionId, data: null });
                            }
                        }
                    }
                    // Schedule batch write
                    if (!writeTimeout) {
                        writeTimeout = setTimeout(processBatchWrites, 100); // Batch writes every 100ms
                    }
                    return Promise.resolve();
                }
            }
        },
        saveCreds: () => writeData('creds', null, creds)
    };
};
exports.useSQLiteAuthState = useSQLiteAuthState;
