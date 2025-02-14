import {
  makeWASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  Browsers,
  isJidBroadcast,
  useSQLiteAuthState,
} from '#libary';
import config from '#config';
import { EventEmitter } from 'events';
import {
  Xprocess,
  getMessage,
  saveMessages,
  getConfig,
  logger,
  serialize,
  commands,
  runCommand,
  groupMetadata,
  saveGroupMetadata,
  Xevents,
} from '#src';

EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);

export const client = async () => {
  const session = await useSQLiteAuthState('database.db');
  const { state, saveCreds } = session;

  const conn = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: true,
    logger,
    browser: Browsers.macOS('Desktop'),
    version: (await fetchLatestBaileysVersion()).version,
    emitOwnEvents: true,
    syncFullHistory: true,
    shouldSyncHistoryMessage: true,
    generateHighQualityLinkPreview: true,
    linkPreviewImageThumbnailWidth: 1280,
    cachedGroupMetadata: async (jid) => await groupMetadata(jid),
    getMessage: async (key) => {
      const store = await getMessage(key.id);
      return store ? store : { conversation: null };
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
          lastDisconnect.error?.output?.statusCode === DisconnectReason.loggedOut
            ? Xprocess()
            : client();
          break;

        case 'open':
          await conn.sendMessage(conn.user.id, {
            text: `\`\`\`Owner: ${config.BOT_INFO.split(';')[0]}\nVersion: ${config.VERSION}\nCommands: ${
              commands.filter(
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
        if (autoRead) await conn.readMessages([msg.key]);
        if (autoStatusRead && isJidBroadcast(msg.jid)) await conn.readMessages([msg.key]);
        if (autolikestatus && isJidBroadcast(msg.jid)) {
          await conn.sendMessage(
            msg.jid,
            { react: { key: msg.key, text: '💚' } },
            { statusJidList: [message.key?.participant, conn?.user?.id] }
          );
        }
        await Promise.all([runCommand(msg, conn), Xevents(msg, conn), saveMessages(msg)]);
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
