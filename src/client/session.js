import { mkdirSync, writeFileSync } from 'node:fs';
import { createDecipheriv } from 'node:crypto';
import { join } from 'node:path';
import { config } from '#config';
import { LANG } from '#src';

async function getSession() {
  try {
    const res = await fetch(`${LANG.SESSION_URI}${config.SESSION_ID}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function initSession() {
  const Source = await getSession();
  if (!Source) return console.log('No Session from Server');
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(Source.key, 'hex');
  const iv = Buffer.from(Source.iv, 'hex');
  const decipher = createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(Source.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  const data = JSON.parse(decrypted);
  mkdirSync(`session/${config.SESSION_ID}`, { recursive: true });
  writeFileSync(
    join(`session/${config.SESSION_ID}`, 'creds.json'),
    JSON.stringify(data.creds, null, 2)
  );
  for (const [filename, syncKeyData] of Object.entries(data.syncKeys)) {
    writeFileSync(
      join(`session/${config.SESSION_ID}`, filename),
      JSON.stringify(syncKeyData, null, 2)
    );
  }
  console.log(LANG.CONNECTED_SESSION);
  return data;
}
