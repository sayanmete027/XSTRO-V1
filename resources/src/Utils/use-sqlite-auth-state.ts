import { Database } from 'sqlite3'
import { proto } from '../../WAProto'
import { AuthenticationCreds, AuthenticationState } from '../Types'
import { initAuthCreds } from './auth-utils'
import { BufferJSON } from './generics'

export const useSQLiteAuthState = async(dbPath: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> => {
    const db = await new Promise<Database>((resolve, reject) => {
        const db = new Database(dbPath, (err) => {
            err ? reject(err) : resolve(db)
        })
    })

    // Initialize database schema
    await new Promise<void>((resolve, reject) => {
        db.exec(`
            CREATE TABLE IF NOT EXISTS session (
                id TEXT PRIMARY KEY,
                data TEXT
            );
        `, (err) => (err ? reject(err) : resolve()))
    })

    // Enable WAL mode for better concurrency
    await new Promise<void>((resolve, reject) => {
        db.run('PRAGMA journal_mode = WAL;', (err) => (err ? reject(err) : resolve()))
    })

    const readData = async <T>(type: string, id?: string): Promise<T | null> => {
        return new Promise((resolve, reject) => {
            const sessionId = id ? `${type}:${id}` : type
            db.get(
                'SELECT data FROM session WHERE id = ?',
                [sessionId],
                (err, row: { data: string }) => {
                    if (err) return reject(err)
                    if (!row) return resolve(null)
                    
                    try {
                        const data = JSON.parse(row.data, BufferJSON.reviver)
                        resolve(data)
                    } catch (parseError) {
                        reject(parseError)
                    }
                }
            )
        })
    }

    const writeData = async (type: string, id: string | null, data: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            const serialized = JSON.stringify(data, BufferJSON.replacer)
            const sessionId = id ? `${type}:${id}` : type
            
            db.run(
                'INSERT INTO session (id, data) VALUES (?, ?) ' +
                'ON CONFLICT(id) DO UPDATE SET data = excluded.data',
                [sessionId, serialized],
                (err) => (err ? reject(err) : resolve())
            )
        })
    }

    const deleteData = async (type: string, id: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const sessionId = `${type}:${id}`
            db.run(
                'DELETE FROM session WHERE id = ?',
                [sessionId],
                (err) => (err ? reject(err) : resolve())
            )
        })
    }

    // Initialize or load credentials
    const credsData = await readData<AuthenticationCreds>('creds')
    const creds = credsData || initAuthCreds()
    if (!credsData) {
        await writeData('creds', null, creds)
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    return new Promise((resolve, reject) => {
                        const result: { [key: string]: any } = {}
                        const sessionIds = ids.map(id => `${type}:${id}`)
                        
                        db.all(
                            'SELECT id, data FROM session WHERE id IN (' + sessionIds.map(() => '?').join(',') + ')',
                            sessionIds,
                            (err, rows: Array<{ id: string, data: string }>) => {
                                if (err) return reject(err)
                                
                                rows.forEach(row => {
                                    try {
                                        const originalId = row.id.split(':')[1]
                                        let data = JSON.parse(row.data, BufferJSON.reviver)
                                        if (type === 'app-state-sync-key') {
                                            data = proto.Message.AppStateSyncKeyData.fromObject(data)
                                        }
                                        result[originalId] = data
                                    } catch (parseError) {
                                        reject(parseError)
                                    }
                                })
                                
                                ids.forEach(id => {
                                    if (!(id in result)) {
                                        result[id] = null
                                    }
                                })
                                
                                resolve(result)
                            }
                        )
                    })
                },
                set: async (data) => {
                    return new Promise((resolve, reject) => {
                        db.serialize(() => {
                            db.run('BEGIN TRANSACTION')
                            
                            try {
                                for (const category in data) {
                                    for (const id in data[category]) {
                                        const value = data[category][id]
                                        const sessionId = `${category}:${id}`
                                        
                                        if (value) {
                                            const serialized = JSON.stringify(value, BufferJSON.replacer)
                                            db.run(
                                                'INSERT INTO session (id, data) VALUES (?, ?) ' +
                                                'ON CONFLICT(id) DO UPDATE SET data = excluded.data',
                                                [sessionId, serialized]
                                            )
                                        } else {
                                            db.run(
                                                'DELETE FROM session WHERE id = ?',
                                                [sessionId]
                                            )
                                        }
                                    }
                                }
                                
                                db.run('COMMIT', (err) => (err ? reject(err) : resolve()))
                            } catch (error) {
                                db.run('ROLLBACK')
                                reject(error)
                            }
                        })
                    })
                }
            }
        },
        saveCreds: () => writeData('creds', null, creds)
    }
}