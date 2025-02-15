"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMediaMessage = isMediaMessage;
exports.downloadMessage = downloadMessage;
const promises_1 = require("fs/promises");
const resources_1 = require("../../resources");
const src_1 = require("../../src");
function isMediaMessage(message) {
    const msg = resources_1.WAProto.WebMessageInfo.fromObject(message);
    const messageType = (0, resources_1.getContentType)(msg.message);
    return [
        'imageMessage',
        'documentMessage',
        'audioMessage',
        'videoMessage',
        'stickerMessage',
    ].includes(messageType);
}
async function downloadMessage(message, asSaveFile = false) {
    if (!message || !isMediaMessage(message))
        throw new Error('Message must be a media message');
    const msg = resources_1.WAProto.WebMessageInfo.fromObject(message);
    const media = await (0, resources_1.downloadMediaMessage)(msg, 'buffer', {});
    if (asSaveFile) {
        const ext = await (0, src_1.FileTypeFromBuffer)(media);
        return await (0, promises_1.writeFile)(`${message.key.id}.${ext}`, media);
    }
    return media;
}
