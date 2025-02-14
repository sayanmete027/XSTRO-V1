import { getDb } from './database.js';

async function initConfigDb() {
  const db = await getDb();
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

export async function getConfig() {
  const db = await getDb();
  await initConfigDb();

  const row = await db.get('SELECT * FROM config LIMIT 1');
  if (!row) return null;

  return {
    prefix: !Array.isArray(row.prefix) ? Array.from(row.prefix) : row.prefix,
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
    bannedusers: JSON.parse(row.bannedusers),
  };
}

export async function editConfig(updates) {
  const db = await getDb();
  await initConfigDb();

  const allowedKeys = [
    'prefix',
    'mode',
    'autoRead',
    'autoStatusRead',
    'autolikestatus',
    'disablegc',
    'disabledm',
    'cmdReact',
    'cmdRead',
    'savebroadcast',
    'disabledCmds',
    'sudo',
    'bannedusers',
  ];

  const keys = Object.keys(updates).filter((key) => allowedKeys.includes(key));
  if (!keys.length) return;

  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  const values = keys.map((key) => {
    const val = updates[key];
    if (key === 'prefix') return val;
    if (Array.isArray(val)) return JSON.stringify(val);
    if (typeof val === 'boolean') return val ? 1 : 0;
    return val;
  });

  await db.run(
    `UPDATE config SET ${setClause} WHERE id = (SELECT id FROM config LIMIT 1)`,
    ...values
  );
  return getConfig();
}
