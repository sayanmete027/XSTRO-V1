import {
  makeWASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  Browsers,
  isJidBroadcast,
  useSQLiteAuthState,
} from '#libary';
import Message from './message.js';
import config from '#config';
import { EventEmitter } from 'events';
import {
  Xprocess,
  toJid,
  getMessage,
  saveMessages,
  getConfig,
  logger,
  serialize,
  commands,
  runCommand,
  groupMetadata,
  LANG,
  saveGroupMetadata,
  editConfig,
} from '#src';

EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);

export const client = async () => {
  const session = await useSQLiteAuthState('database.db');
  const { state, saveCreds } = session;
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: true,
    logger,
    browser: Browsers.windows('chrome'),
    version,
    emitOwnEvents: true,
    syncFullHistory: false,
    shouldSyncHistoryMessage: false,
    generateHighQualityLinkPreview: true,
    linkPreviewImageThumbnailWidth: 1280,
    cachedGroupMetadata: async (jid) => await groupMetadata(jid),
    getMessage: async (key) => {
      const store = await getMessage(key.id);
      return store ? store : { conversation: null };
    },
  });

  conn.ev.process(async (events) => {
    if (events.call) await AntiCall(events.call, conn);

    if (events['connection.update']) {
      const { connection, lastDisconnect } = events['connection.update'];
      switch (connection) {
        case 'connecting':
          console.log(LANG.START_BOOT);
          break;

        case 'close':
          lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut
            ? Xprocess()
            : client();
          break;

        case 'open':
          await editConfig({sudo: [toJid(conn.user?.id)]})
          const cmds = commands.filter(
            (cmd) =>
              cmd.pattern &&
              !cmd.dontAddCommandList &&
              !cmd.pattern.toString().includes('undefined')
          ).length;
          await conn.sendMessage(conn.user.id, {
            text: `\`\`\`${LANG.CONNECTED}\n\nVersion: ${config.VERSION}\n\nPlugins: ${cmds}\`\`\``,
          });
          console.log(LANG.PROCESS_STARTED);
          break;
      }
    }

    if (events['creds.update']) await saveCreds();

    if (events['messages.upsert']) {
      const { messages } = events['messages.upsert'];
      const { autoRead, autoStatusRead, autolikestatus } = await getConfig();

      for (const message of messages) {
        const msg = await serialize(structuredClone(message), conn);
        const data = new Message(conn, msg);
        if (autoRead) await conn.readMessages([msg.key]);
        if (autoStatusRead && isJidBroadcast(msg.from)) await conn.readMessages([msg.key]);
        if (autolikestatus && isJidBroadcast(msg.from)) {
          await conn.sendMessage(
            msg.from,
            { react: { key: msg.key, text: '💚' } },
            { statusJidList: [message.key.participant, conn.user.id] }
          );
        }
        await Promise.all([runCommand(data, msg, conn), saveMessages(msg)]);
      }
    }
  });

  setInterval(async () => {
    const groupsMetadata = await conn.groupFetchAllParticipating();
    for (const [id, metadata] of Object.entries(groupsMetadata)) {
      await saveGroupMetadata(id, metadata);
    }
  }, 300 * 1000);

  return conn;
};
