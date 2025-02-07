import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { config } from '#config';
import { runtime, XSTRO } from '#utils';

const database = open({
  filename: 'database.db',
  driver: sqlite3.Database,
});

const initDB = async () => {
  const db = await database;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS alive (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      message TEXT
    )
  `);
  await db.run(`INSERT OR IGNORE INTO alive (id, message) VALUES (1, NULL)`);
};

const getAliveMsg = async () => {
  await initDB();
  const db = await database;
  const result = await db.get(`SELECT message FROM alive WHERE id = 1`);
  return (
    result?.message ||
    `@user χѕтяσ мυℓтι ∂єνι¢є ιѕ αℓινє, α ѕιмρℓє ωнαтѕαρρ вσт мα∂є ωιтн иσ∂є נѕ\n\n*яυитιмє: &runtime*\n\n*νιѕιт ωιкι ραgє тσ ¢υѕтσмιzє αℓινє мєѕѕαgє*\n\nhttps://github.com/AstroX11/Xstro/wiki/Alive-Message`
  );
};

const setAliveMsg = async (text) => {
  await initDB();
  const db = await database;
  await db.run(`UPDATE alive SET message = ? WHERE id = 1`, [text]);
  return true;
};

const aliveMessage = async (message) => {
  const msg = await getAliveMsg();
  return msg
    .replace(/&runtime/g, runtime(process.uptime()))
    .replace(/&user/g, message.pushName || 'user')
    .replace(/@user/g, `@${message.sender.split('@')[0]}`)
    .replace(/&owner/g, config.BOT_INFO.split(';')[0])
    .replace(/&botname/g, config.BOT_INFO.split(';')[1])
    .replace(/&facts/g, await XSTRO.facts())
    .replace(/&quotes/g, await XSTRO.quotes())
    .replace(/&rizz/g, await XSTRO.rizz());
};

export { getAliveMsg, setAliveMsg, aliveMessage };
