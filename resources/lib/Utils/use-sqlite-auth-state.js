"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSQLiteAuthState = void 0;
const sqlite3_1 = require("sqlite3");
const WAProto_1 = require("../../WAProto");
const auth_utils_1 = require("./auth-utils");
const generics_1 = require("./generics");
const useSQLiteAuthState = async (dbPath) => {
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
    // Enable WAL mode for better concurrency
    await new Promise((resolve, reject) => {
        db.run('PRAGMA journal_mode = WAL;', (err) => (err ? reject(err) : resolve()));
    });
    const readData = async (type, id) => {
        return new Promise((resolve, reject) => {
            const sessionId = id ? `${type}:${id}` : type;
            db.get('SELECT data FROM session WHERE id = ?', [sessionId], (err, row) => {
                if (err)
                    return reject(err);
                if (!row)
                    return resolve(null);
                try {
                    const data = JSON.parse(row.data, generics_1.BufferJSON.reviver);
                    resolve(data);
                }
                catch (parseError) {
                    reject(parseError);
                }
            });
        });
    };
    const writeData = async (type, id, data) => {
        return new Promise((resolve, reject) => {
            const serialized = JSON.stringify(data, generics_1.BufferJSON.replacer);
            const sessionId = id ? `${type}:${id}` : type;
            db.run('INSERT INTO session (id, data) VALUES (?, ?) ' +
                'ON CONFLICT(id) DO UPDATE SET data = excluded.data', [sessionId, serialized], (err) => (err ? reject(err) : resolve()));
        });
    };
    const deleteData = async (type, id) => {
        return new Promise((resolve, reject) => {
            const sessionId = `${type}:${id}`;
            db.run('DELETE FROM session WHERE id = ?', [sessionId], (err) => (err ? reject(err) : resolve()));
        });
    };
    // Initialize or load credentials
    const credsData = await readData('creds');
    const creds = credsData || (0, auth_utils_1.initAuthCreds)();
    if (!credsData) {
        await writeData('creds', null, creds);
    }
    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    return new Promise((resolve, reject) => {
                        const result = {};
                        const sessionIds = ids.map(id => `${type}:${id}`);
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
                    return new Promise((resolve, reject) => {
                        db.serialize(() => {
                            db.run('BEGIN TRANSACTION');
                            try {
                                for (const category in data) {
                                    for (const id in data[category]) {
                                        const value = data[category][id];
                                        const sessionId = `${category}:${id}`;
                                        if (value) {
                                            const serialized = JSON.stringify(value, generics_1.BufferJSON.replacer);
                                            db.run('INSERT INTO session (id, data) VALUES (?, ?) ' +
                                                'ON CONFLICT(id) DO UPDATE SET data = excluded.data', [sessionId, serialized]);
                                        }
                                        else {
                                            db.run('DELETE FROM session WHERE id = ?', [sessionId]);
                                        }
                                    }
                                }
                                db.run('COMMIT', (err) => (err ? reject(err) : resolve()));
                            }
                            catch (error) {
                                db.run('ROLLBACK');
                                reject(error);
                            }
                        });
                    });
                }
            }
        },
        saveCreds: () => writeData('creds', null, creds)
    };
};
exports.useSQLiteAuthState = useSQLiteAuthState;
