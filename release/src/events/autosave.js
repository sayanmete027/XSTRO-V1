"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoSaveBroadCast = autoSaveBroadCast;
const resources_1 = require("../../resources");
const src_1 = require("../../src");
/**
 * Purpose of this to Automatically save status
 */
async function autoSaveBroadCast(message) {
    var _a;
    /** Fetch AutoSaveBroadCast from Our DB */
    const { savebroadcast } = await (0, src_1.getConfig)();
    /** If the there's no status or the status is from myself, we ignore it */
    if (!savebroadcast || !(0, resources_1.isJidBroadcast)(message.jid) || ((_a = message.key) === null || _a === void 0 ? void 0 : _a.participant) === message.owner) {
        return;
    }
    /** Easy Method, we just forward the broadcast status to our dm, this takes less than a second, it's fast and reliable */
    return await message.forward(message.owner, message, { quoted: message });
}
