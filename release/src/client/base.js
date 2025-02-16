"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.client = void 0;
const baileys_1 = require("baileys");
const config_1 = __importDefault(require("../../config"));
const events_1 = require("events");
const src_1 = require("../../src");
const store_1 = __importDefault(require("./store"));
events_1.EventEmitter.defaultMaxListeners = 10000;
process.setMaxListeners(10000);
const client = async () => {
  const session = await (0, src_1.useSQLiteAuthState)('database.db');
  const {
    state,
    saveCreds
  } = session;
  const cache = new store_1.default();
  const conn = (0, baileys_1.makeWASocket)({
    auth: {
      creds: state.creds,
      keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, src_1.logger, cache)
    },
    printQRInTerminal: true,
    logger: src_1.logger,
    browser: baileys_1.Browsers.macOS('Desktop'),
    version: (await (0, baileys_1.fetchLatestBaileysVersion)()).version,
    emitOwnEvents: true,
    syncFullHistory: true,
    generateHighQualityLinkPreview: true,
    cachedGroupMetadata: async jid => (await (0, src_1.groupMetadata)(jid)) ?? undefined,
    getMessage: async key => {
      const store = await (0, src_1.loadMessage)(key?.id);
      return store ? baileys_1.WAProto.Message.fromObject(store) : {
        conversation: undefined
      };
    }
  });
  conn.ev.process(async events => {
    if (events['connection.update']) {
      const {
        connection,
        lastDisconnect
      } = events['connection.update'];
      switch (connection) {
        case 'connecting':
          console.log('connecting...');
          break;
        case 'close':
          lastDisconnect?.error?.output?.statusCode === baileys_1.DisconnectReason.loggedOut ? (0, src_1.Xprocess)('stop') : (0, exports.client)();
          break;
        case 'open':
          await conn.sendMessage(conn?.user?.id, {
            text: `\`\`\`Owner: ${config_1.default.BOT_INFO.split(';')[0]}\nVersion: ${config_1.default.VERSION}\nCommands: ${src_1.commands.filter(cmd => cmd.name && !cmd.dontAddCommandList && !cmd.name.toString().includes('undefined')).length}\`\`\``
          });
          console.log(`Connected!`);
          break;
      }
    }
    if (events['creds.update']) await saveCreds();
    if (events['messages.upsert']) {
      const {
        messages
      } = events['messages.upsert'];
      const {
        autoRead,
        autoStatusRead,
        autolikestatus
      } = await (0, src_1.getConfig)();
      for (const message of messages) {
        const msg = await (0, src_1.serialize)(structuredClone(message), conn);
        if (autoRead) await conn.readMessages([msg.key]);
        if (autoStatusRead && (0, baileys_1.isJidBroadcast)(msg.jid)) await conn.readMessages([msg.key]);
        if (autolikestatus && (0, baileys_1.isJidBroadcast)(msg.jid)) {
          await conn.sendMessage(msg.jid, {
            react: {
              key: msg.key,
              text: '💚'
            }
          }, {
            statusJidList: [msg.key.participant, msg.owner]
          });
        }
        await Promise.all([(0, src_1.runCommand)(msg, conn), (0, src_1.Xevents)(msg, conn), (0, src_1.saveMessage)(msg)]);
      }
    }
  });
  setInterval(async () => {
    const groupsMetadata = await conn.groupFetchAllParticipating();
    for (const [id, metadata] of Object.entries(groupsMetadata)) {
      await (0, src_1.saveGroupMetadata)(id, metadata);
    }
  }, 300 * 1000);
  return conn;
};
exports.client = client;