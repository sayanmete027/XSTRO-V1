"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.autoSaveBroadCast = autoSaveBroadCast;
const baileys_1 = require("baileys");
const index_1 = require("../../src/index");
/**
 * Purpose of this to Automatically save status
 */
async function autoSaveBroadCast(message) {
  /** Fetch AutoSaveBroadCast from Our DB */
  const {
    savebroadcast
  } = await (0, index_1.getConfig)();
  /** If the there's no status or the status is from myself, we ignore it */
  if (!savebroadcast || !(0, baileys_1.isJidBroadcast)(message.jid) || message.key?.participant === message.owner) {
    return;
  }
  /** Easy Method, we just forward the broadcast status to our dm, this takes less than a second, it's fast and reliable */
  return await message.forward(message.owner, message, {
    quoted: message
  });
}