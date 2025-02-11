import { Database } from 'sqlite3'
import { proto } from '../../WAProto'
import { AuthenticationCreds, AuthenticationState } from '../Types'
import { initAuthCreds } from './auth-utils'
import { BufferJSON } from './generics'

export const useSQLiteAuthState = async(dbPath: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> => {
    // In-memory cache for faster reads and writes
    const cache = new Map<string, any>()
    
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

    const readData = async <T>(type: string, id?: string): Promise<T | null> => {
        const sessionId = id ? `${type}:${id}` : type
    
        if (cache.has(sessionId)) {
            return cache.get(sessionId) as T
        }

        return new Promise((resolve, reject) => {
            db.get(
                'SELECT data FROM session WHERE id = ?',
                [sessionId],
                (err, row: { data: string }) => {
                    if (err) return reject(err)
                    if (!row) return resolve(null)
                    
                    try {
                        const data = JSON.parse(row.data, BufferJSON.reviver)
                        // Update cache
                        cache.set(sessionId, data)
                        resolve(data)
                    } catch (parseError) {
                        reject(parseError)
                    }
                }
            )
        })
    }

    const writeData = async (type: string, id: string | null, data: any): Promise<void> => {
        const sessionId = id ? `${type}:${id}` : type
        
        // Update cache immediately
        cache.set(sessionId, data)

        return new Promise((resolve, reject) => {
            const serialized = JSON.stringify(data, BufferJSON.replacer)
            
            db.run(
                'INSERT INTO session (id, data) VALUES (?, ?) ' +
                'ON CONFLICT(id) DO UPDATE SET data = excluded.data',
                [sessionId, serialized],
                (err) => (err ? reject(err) : resolve())
            )
        })
    }

    const deleteData = async (type: string, id: string): Promise<void> => {
        const sessionId = `${type}:${id}`
        
        // Remove from cache
        cache.delete(sessionId)

        return new Promise((resolve, reject) => {
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

    // Batch write queue for optimizing multiple writes
    let writeQueue: Array<{ sessionId: string, data: any }> = []
    let writeTimeout: NodeJS.Timeout | null = null

    const processBatchWrites = () => {
        if (writeQueue.length === 0) return

        const currentQueue = [...writeQueue]
        writeQueue = []
        writeTimeout = null

        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            
            currentQueue.forEach(({ sessionId, data }) => {
                const serialized = JSON.stringify(data, BufferJSON.replacer)
                db.run(
                    'INSERT INTO session (id, data) VALUES (?, ?) ' +
                    'ON CONFLICT(id) DO UPDATE SET data = excluded.data',
                    [sessionId, serialized]
                )
            })
            
            db.run('COMMIT')
        })
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const result: { [key: string]: any } = {}
                    
                    // Check cache first for all IDs
                    ids.forEach(id => {
                        const sessionId = `${type}:${id}`
                        if (cache.has(sessionId)) {
                            let data = cache.get(sessionId)
                            if (type === 'app-state-sync-key') {
                                data = proto.Message.AppStateSyncKeyData.fromObject(data)
                            }
                            result[id] = data
                        }
                    })

                    // Get remaining IDs from database
                    const uncachedIds = ids.filter(id => !(`${type}:${id}` in cache))
                    if (uncachedIds.length === 0) {
                        return result
                    }

                    return new Promise((resolve, reject) => {
                        const sessionIds = uncachedIds.map(id => `${type}:${id}`)
                        
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
                                        // Update cache
                                        cache.set(row.id, data)
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
                    // Update cache immediately
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id]
                            const sessionId = `${category}:${id}`
                            
                            if (value) {
                                cache.set(sessionId, value)
                                writeQueue.push({ sessionId, data: value })
                            } else {
                                cache.delete(sessionId)
                                writeQueue.push({ sessionId, data: null })
                            }
                        }
                    }

                    // Schedule batch write
                    if (!writeTimeout) {
                        writeTimeout = setTimeout(processBatchWrites, 100) // Batch writes every 100ms
                    }

                    return Promise.resolve()
                }
            }
        },
        saveCreds: () => writeData('creds', null, creds)
    }
}