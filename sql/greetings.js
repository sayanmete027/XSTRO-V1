import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS greetings (
      jid TEXT,
      type TEXT,
      action INTEGER,
      message TEXT,
      PRIMARY KEY (jid, type)
    )
  `);
  return db;
};

export async function addWelcome(jid, action, message) {
  const db = await initDb();
  await db.run(
    `INSERT INTO greetings (jid, type, action, message) 
     VALUES (?, 'welcome', ?, ?) 
     ON CONFLICT(jid, type) 
     DO UPDATE SET action = excluded.action, message = excluded.message`,
    [jid, action ? 1 : 0, JSON.stringify(message)]
  );
}

export async function addGoodbye(jid, action, message) {
  const db = await initDb();
  await db.run(
    `INSERT INTO greetings (jid, type, action, message) 
     VALUES (?, 'goodbye', ?, ?) 
     ON CONFLICT(jid, type) 
     DO UPDATE SET action = excluded.action, message = excluded.message`,
    [jid, action ? 1 : 0, JSON.stringify(message)]
  );
}

export async function getWelcome(jid) {
  const db = await initDb();
  const data = await db.get(
    `SELECT action, message FROM greetings WHERE jid = ? AND type = 'welcome'`,
    [jid]
  );
  return data
    ? { action: !!data.action, message: JSON.parse(data.message) }
    : { action: false, message: null };
}

export async function getGoodbye(jid) {
  const db = await initDb();
  const data = await db.get(
    `SELECT action, message FROM greetings WHERE jid = ? AND type = 'goodbye'`,
    [jid]
  );
  return data
    ? { action: !!data.action, message: JSON.parse(data.message) }
    : { action: false, message: null };
}

export async function isWelcomeOn(jid) {
  const db = await initDb();
  const data = await db.get(`SELECT action FROM greetings WHERE jid = ? AND type = 'welcome'`, [
    jid,
  ]);
  return data ? !!data.action : false;
}

export async function isGoodByeOn(jid) {
  const db = await initDb();
  const data = await db.get(`SELECT action FROM greetings WHERE jid = ? AND type = 'goodbye'`, [
    jid,
  ]);
  return data ? !!data.action : false;
}

export async function delWelcome(jid) {
  const db = await initDb();
  await db.run(`DELETE FROM greetings WHERE jid = ? AND type = 'welcome'`, [jid]);
}

export async function delGoodBye(jid) {
  const db = await initDb();
  await db.run(`DELETE FROM greetings WHERE jid = ? AND type = 'goodbye'`, [jid]);
}
