"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initSession = initSession;
const node_fs_1 = require("node:fs");
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
const config_1 = require("../../config");
const index_1 = require("../../src/index");
async function getSession() {
  try {
    const res = await fetch(`${index_1.LANG.SESSION_URI}${config_1.config.SESSION_ID}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
async function initSession() {
  const source = await getSession();
  if (!source) {
    console.log('No Session from Server');
    return;
  }
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(source.key, 'hex');
  const iv = Buffer.from(source.iv, 'hex');
  const decipher = (0, node_crypto_1.createDecipheriv)(algorithm, key, iv);
  let decrypted = decipher.update(source.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  const data = JSON.parse(decrypted);
  const sessionPath = `session/${config_1.config.SESSION_ID}`;
  (0, node_fs_1.mkdirSync)(sessionPath, {
    recursive: true
  });
  (0, node_fs_1.writeFileSync)((0, node_path_1.join)(sessionPath, 'creds.json'), JSON.stringify(data.creds, null, 2));
  for (const [filename, syncKeyData] of Object.entries(data.syncKeys)) {
    (0, node_fs_1.writeFileSync)((0, node_path_1.join)(sessionPath, filename), JSON.stringify(syncKeyData, null, 2));
  }
  console.log(index_1.LANG.CONNECTED_SESSION);
  return data;
}