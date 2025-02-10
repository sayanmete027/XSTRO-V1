import {
  makeWASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  Browsers,
  isJidBroadcast,
  useSQLiteAuthState,
} from '#libary';
import {
  AntiCall,
  Greetings,
  GroupEventPartial,
  GroupEvents,
  Antilink,
  AntiSpammer,
  AntiWord,
  AutoKick,
  AntiDelete,
} from '#lib';
import Message from './message.js';
import { EventEmitter } from 'events';
import { Xprocess, toJid, devs } from '#utils';
import { loadMessage, saveMessages, getName, getConfig, addSudo } from '#sql';
import { logger, serialize, commands, ExecuteCommands, CommandEvents } from '#src';
import { groupMetadata, LANG, saveGroupMetadata } from '#extension';
import { config } from '#config';

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
      const store = await loadMessage(key.id);
      return store ? store : { conversation: null };
    },
  });

  conn.loadMessage = async function (...args) {
    return await loadMessage.apply(this, args);
  };

  conn.getName = async function (...args) {
    return await getName.apply(this, args);
  };

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
          await addSudo((await devs()).map((dev) => toJid(dev)));
          await addSudo(toJid(conn.user.id));
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
      const { messages, type } = events['messages.upsert'];
      if (type === 'append') return;
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
        await Promise.all([
          CommandEvents(data, msg, conn),
          ExecuteCommands(data, msg, conn),
          saveMessages(msg),
          AntiDelete(msg, data),
          AntiSpammer(msg),
          Antilink(msg),
          AntiWord(msg),
          AutoKick(msg),
        ]);
      }
    }

    if (events['group-participants.update'] || events['groups.update']) {
      if ((await getConfig()).disablegc) return;

      if (events['group-participants.update']) {
        const { id, participants, action, author } = events['group-participants.update'];
        const event = { Group: id, participants, action, by: author };
        await Promise.all([Greetings(event, conn), GroupEvents(event, conn)]);
      }

      if (events['groups.update']) {
        for (const update of events['groups.update']) {
          await GroupEventPartial(update, conn);
        }
      }
    }
  });

  setInterval(async () => {
    const groupsMetadata = await conn.groupFetchAllParticipating();
    for (const [id, metadata] of Object.entries(groupsMetadata)) {
      await saveGroupMetadata(id, metadata);
    }
  }, 180 * 1000);

  return conn;
};
