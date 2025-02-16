"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfig = getConfig;
exports.editConfig = editConfig;
const database_1 = require("./database");
async function initConfigDb() {
  const db = await (0, database_1.getDb)();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prefix TEXT DEFAULT '.',
      mode INTEGER DEFAULT 1,
      autoRead INTEGER DEFAULT 0,
      autoStatusRead INTEGER DEFAULT 0,
      autolikestatus INTEGER DEFAULT 0,
      disablegc INTEGER DEFAULT 0,
      disabledm INTEGER DEFAULT 0,
      cmdReact INTEGER DEFAULT 1,
      cmdRead INTEGER DEFAULT 0,
      savebroadcast INTEGER DEFAULT 0,
      disabledCmds TEXT DEFAULT '[]',
      sudo TEXT DEFAULT '[]',
      bannedusers TEXT DEFAULT '[]'
    );
  `);
  const exists = await db.get('SELECT id FROM config LIMIT 1');
  if (!exists) {
    await db.run(`
      INSERT INTO config 
        (prefix, mode, autoRead, autoStatusRead, autolikestatus, disablegc, disabledm, cmdReact, cmdRead, savebroadcast, disabledCmds, sudo, bannedusers)
      VALUES 
        ('.', 1, 0, 0, 0, 0, 0, 1, 0, 0, '[]', '[]', '[]')
    `);
  }
}
async function getConfig() {
  const db = await (0, database_1.getDb)();
  await initConfigDb();
  const row = await db.get('SELECT * FROM config LIMIT 1');
  return {
    prefix: row.prefix,
    mode: Boolean(row.mode),
    autoRead: Boolean(row.autoRead),
    autoStatusRead: Boolean(row.autoStatusRead),
    autolikestatus: Boolean(row.autolikestatus),
    disablegc: Boolean(row.disablegc),
    disabledm: Boolean(row.disabledm),
    cmdReact: Boolean(row.cmdReact),
    cmdRead: Boolean(row.cmdRead),
    savebroadcast: Boolean(row.savebroadcast),
    disabledCmds: JSON.parse(row.disabledCmds),
    sudo: JSON.parse(row.sudo),
    bannedusers: JSON.parse(row.bannedusers)
  };
}
async function editConfig(updates) {
  const db = await (0, database_1.getDb)();
  await initConfigDb();
  const allowedKeys = ['prefix', 'mode', 'autoRead', 'autoStatusRead', 'autolikestatus', 'disablegc', 'disabledm', 'cmdReact', 'cmdRead', 'savebroadcast', 'disabledCmds', 'sudo', 'bannedusers'];
  const keys = Object.keys(updates).filter(key => allowedKeys.includes(key));
  if (!keys.length) return null;
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  const values = keys.map(key => {
    const val = updates[key];
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (Array.isArray(val)) return JSON.stringify(val);
    return val;
  });
  await db.run(`UPDATE config SET ${setClause} WHERE id = (SELECT id FROM config LIMIT 1)`, ...values);
  return getConfig();
}