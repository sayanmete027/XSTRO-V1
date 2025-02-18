import {
  makeWASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  Browsers,
  isJidBroadcast,
  WAProto,
  WASocket
} from 'baileys';
import * as P from 'pino'
import { Boom } from '@hapi/boom';
import config from '../../config.mjs';
import { EventEmitter } from 'events';
import {
  Xprocess,
  useSQLiteAuthState,
  getConfig,
  serialize,
  commands,
  runCommand,
  groupMetadata,
  saveGroupMetadata,
  Xevents,
  loadMessage,
  saveMessage
} from '../../src/index.mjs';
import CacheStore from './store.mjs';

EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);

export const logger = P.pino({
  level: config.DEBUG ? 'info' : 'silent',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

export const client = async (): Promise<WASocket> => {
  const session = await useSQLiteAuthState('database.db');
  const { state, saveCreds } = session;
  const cache = new CacheStore()

  const conn = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger, cache),
    },
    printQRInTerminal: true,
    logger,
    browser: Browsers.macOS('Desktop'),
    version: (await fetchLatestBaileysVersion()).version,
    emitOwnEvents: true,
    syncFullHistory: true,
    generateHighQualityLinkPreview: true,
    cachedGroupMetadata: async (jid) => (await groupMetadata(jid)) ?? undefined,
    getMessage: async (key) => {
      const store = await loadMessage(key?.id!);
      return store ? WAProto.Message.fromObject(store) : { conversation: undefined };
    },
  });

  conn.ev.process(async (events) => {
    if (events['connection.update']) {
      const { connection, lastDisconnect } = events['connection.update'];
      switch (connection) {
        case 'connecting':
          console.log('connecting...');
          break;
        case 'close':
          (lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.loggedOut
            ? Xprocess('stop')
            : client();
          break;

        case 'open':
          await conn.sendMessage(conn?.user?.id!, {
            text: `\`\`\`Owner: ${config.BOT_INFO.split(';')[0]}\nVersion: ${config.VERSION}\nCommands: ${commands.filter(
              (cmd) =>
                cmd.name && !cmd.dontAddCommandList && !cmd.name.toString().includes('undefined')
            ).length
              }\`\`\``,
          });
          console.log(`Connected!`);
          break;
      }
    }

    if (events['creds.update']) await saveCreds();

    if (events['messages.upsert']) {
      const { messages } = events['messages.upsert'];
      const { autoRead, autoStatusRead, autolikestatus } = await getConfig();

      for (const message of messages) {
        const msg = await serialize(structuredClone(message), conn);
        if (!msg) return
        if (autoRead) await conn.readMessages([msg.key]);
        if (autoStatusRead && isJidBroadcast(msg.jid)) await conn.readMessages([msg.key]);
        if (autolikestatus && isJidBroadcast(msg.jid)) {
          await conn.sendMessage(
            msg.jid,
            { react: { key: msg.key, text: '💚' } },
            { statusJidList: [msg.key.participant, msg.owner] }
          );
        }
        await Promise.all([runCommand(msg), Xevents(msg, conn), saveMessage(msg)]);
      }
    }
  });

  const countdownDuration = 5 * 60 * 1000;
  setInterval(async () => {
    logger.debug('Starting metadata fetch cycle...');

    let countdown = countdownDuration / 1000; // in seconds
    const countdownInterval = setInterval(() => {
      logger.debug(`Saving metadata in ${countdown} seconds...`);
      countdown -= 1;

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        logger.debug('Countdown finished, saving metadata now...');

        saveMetadata();
      }
    }, 1000); // Countdown every second
  }, 300 * 1000); // Trigger every 5 minutes

  async function saveMetadata() {
    logger.debug('Fetching groups metadata...');
    const groupsMetadata = await conn.groupFetchAllParticipating();
    for (const [id, metadata] of Object.entries(groupsMetadata)) {
      logger.debug(`Saving metadata for group ID: ${id}`);
      await saveGroupMetadata(id, metadata);
    }
    logger.info('Group metadata saved successfully.');
  }


  return conn;
};
