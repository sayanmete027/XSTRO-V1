/**
 * Private Code, Create your own
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { createDecipheriv } from "node:crypto";
import { join } from "node:path";
import { config } from "../../config.mjs";
import { LANG } from "#default";

interface SessionData {
    key: string;
    iv: string;
    data: string;
}

interface DecryptedSession {
    creds: Record<string, unknown>;
    syncKeys: Record<string, unknown>;
}

async function getSession(): Promise<SessionData | null> {
    try {
        const res = await fetch(`${LANG.SESSION_URI}${config.SESSION_ID}`);
        if (!res.ok) return null;
        return (await res.json()) as SessionData;
    } catch {
        return null;
    }
}

export async function initSession(): Promise<DecryptedSession | void> {
    const source = await getSession();
    if (!source) {
        console.log("No Session from Server");
        return;
    }

    const algorithm = "aes-256-cbc";
    const key = Buffer.from(source.key, "hex");
    const iv = Buffer.from(source.iv, "hex");
    const decipher = createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(source.data, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const data: DecryptedSession = JSON.parse(decrypted);
    const sessionPath = `session/${config.SESSION_ID}`;
    mkdirSync(sessionPath, { recursive: true });
    writeFileSync(join(sessionPath, "creds.json"), JSON.stringify(data.creds, null, 2));

    for (const [filename, syncKeyData] of Object.entries(data.syncKeys)) {
        writeFileSync(join(sessionPath, filename), JSON.stringify(syncKeyData, null, 2));
    }

    console.log(LANG.CONNECTED_SESSION);
    return data;
}
