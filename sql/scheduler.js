import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDb = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      groupId TEXT UNIQUE NOT NULL,
      muteTime TEXT NOT NULL,
      unmuteTime TEXT NOT NULL,
      isMuted BOOLEAN NOT NULL,
      isScheduled BOOLEAN NOT NULL
    );
  `);
  return db;
};

export const addOrUpdateSchedule = async (
  groupId,
  muteTime,
  unmuteTime,
  isMuted = false,
  isScheduled = false
) => {
  const db = await initDb();
  const existingSchedule = await db.get(`SELECT * FROM schedules WHERE groupId = ?`, [groupId]);

  if (existingSchedule) {
    await db.run(
      `UPDATE schedules SET muteTime = ?, unmuteTime = ?, isMuted = ?, isScheduled = ? WHERE groupId = ?`,
      [muteTime, unmuteTime, isMuted, isScheduled, groupId]
    );
    return { id: existingSchedule.id, groupId, muteTime, unmuteTime, isMuted, isScheduled };
  }

  const result = await db.run(
    `INSERT INTO schedules (groupId, muteTime, unmuteTime, isMuted, isScheduled) VALUES (?, ?, ?, ?, ?)`,
    [groupId, muteTime, unmuteTime, isMuted, isScheduled]
  );

  return { id: result.lastID, groupId, muteTime, unmuteTime, isMuted, isScheduled };
};

export const getSchedule = async (groupId) => {
  const db = await initDb();
  return db.get(`SELECT * FROM schedules WHERE groupId = ?`, [groupId]);
};

export const removeSchedule = async (groupId) => {
  const db = await initDb();
  const result = await db.run(`DELETE FROM schedules WHERE groupId = ?`, [groupId]);
  return result.changes > 0;
};

export const getAllSchedules = async () => {
  const db = await initDb();
  return db.all(`SELECT * FROM schedules`);
};
