"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize = serialize;
const resources_1 = require("../../resources");
const src_1 = require("../../src");
async function serialize(message, client) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17;
    const { sudo, prefix, mode, bannedusers } = await (0, src_1.getConfig)();
    const owner = (0, src_1.toJid)((_a = client === null || client === void 0 ? void 0 : client.user) === null || _a === void 0 ? void 0 : _a.id);
    const isGroup = (0, resources_1.isJidGroup)((_b = message === null || message === void 0 ? void 0 : message.key) === null || _b === void 0 ? void 0 : _b.remoteJid);
    const isStatus = (0, resources_1.isJidBroadcast)((_c = message === null || message === void 0 ? void 0 : message.key) === null || _c === void 0 ? void 0 : _c.remoteJid);
    const sender = isGroup || isStatus
        ? (_d = message === null || message === void 0 ? void 0 : message.key) === null || _d === void 0 ? void 0 : _d.participant
        : ((_e = message === null || message === void 0 ? void 0 : message.key) === null || _e === void 0 ? void 0 : _e.fromMe)
            ? owner
            : message.key.remoteJid;
    const msg = (0, resources_1.normalizeMessageContent)(message === null || message === void 0 ? void 0 : message.message);
    const type = (0, resources_1.getContentType)(msg);
    const mBody = ((_f = msg === null || msg === void 0 ? void 0 : msg.extendedTextMessage) === null || _f === void 0 ? void 0 : _f.text) ||
        ((_g = msg === null || msg === void 0 ? void 0 : msg.extendedTextMessage) === null || _g === void 0 ? void 0 : _g.description) ||
        (msg === null || msg === void 0 ? void 0 : msg.conversation) ||
        ((_h = msg === null || msg === void 0 ? void 0 : msg.imageMessage) === null || _h === void 0 ? void 0 : _h.caption) ||
        ((_j = msg === null || msg === void 0 ? void 0 : msg.videoMessage) === null || _j === void 0 ? void 0 : _j.caption) ||
        ((_m = (_l = (_k = msg === null || msg === void 0 ? void 0 : msg.protocolMessage) === null || _k === void 0 ? void 0 : _k.editedMessage) === null || _l === void 0 ? void 0 : _l.extendedTextMessage) === null || _m === void 0 ? void 0 : _m.text) ||
        ((_p = (_o = msg === null || msg === void 0 ? void 0 : msg.protocolMessage) === null || _o === void 0 ? void 0 : _o.editedMessage) === null || _p === void 0 ? void 0 : _p.conversation) ||
        ((_s = (_r = (_q = msg === null || msg === void 0 ? void 0 : msg.protocolMessage) === null || _q === void 0 ? void 0 : _q.editedMessage) === null || _r === void 0 ? void 0 : _r.imageMessage) === null || _s === void 0 ? void 0 : _s.caption) ||
        ((_v = (_u = (_t = msg === null || msg === void 0 ? void 0 : msg.protocolMessage) === null || _t === void 0 ? void 0 : _t.editedMessage) === null || _u === void 0 ? void 0 : _u.videoMessage) === null || _v === void 0 ? void 0 : _v.caption) ||
        ((_w = msg === null || msg === void 0 ? void 0 : msg.eventMessage) === null || _w === void 0 ? void 0 : _w.description) ||
        ((_x = msg === null || msg === void 0 ? void 0 : msg.eventMessage) === null || _x === void 0 ? void 0 : _x.name) ||
        ((_y = msg === null || msg === void 0 ? void 0 : msg.pollCreationMessageV3) === null || _y === void 0 ? void 0 : _y.name);
    function getContextInfo(msg, type) {
        return msg[type];
    }
    const quoted = (_z = getContextInfo(msg, type)) === null || _z === void 0 ? void 0 : _z.contextInfo;
    const quotedMessage = (0, resources_1.normalizeMessageContent)(quoted === null || quoted === void 0 ? void 0 : quoted.quotedMessage);
    const quotedType = (0, resources_1.getContentType)(quotedMessage);
    const qBody = ((_0 = quotedMessage === null || quotedMessage === void 0 ? void 0 : quotedMessage.extendedTextMessage) === null || _0 === void 0 ? void 0 : _0.text) ||
        ((_1 = quotedMessage === null || quotedMessage === void 0 ? void 0 : quotedMessage.extendedTextMessage) === null || _1 === void 0 ? void 0 : _1.description) ||
        (quotedMessage === null || quotedMessage === void 0 ? void 0 : quotedMessage.conversation) ||
        ((_2 = quotedMessage === null || quotedMessage === void 0 ? void 0 : quotedMessage.imageMessage) === null || _2 === void 0 ? void 0 : _2.caption) ||
        ((_3 = quotedMessage === null || quotedMessage === void 0 ? void 0 : quotedMessage.videoMessage) === null || _3 === void 0 ? void 0 : _3.caption) ||
        ((_4 = quotedMessage === null || quotedMessage === void 0 ? void 0 : quotedMessage.eventMessage) === null || _4 === void 0 ? void 0 : _4.description) ||
        ((_5 = quotedMessage === null || quotedMessage === void 0 ? void 0 : quotedMessage.eventMessage) === null || _5 === void 0 ? void 0 : _5.name) ||
        ((_6 = quotedMessage === null || quotedMessage === void 0 ? void 0 : quotedMessage.pollCreationMessageV3) === null || _6 === void 0 ? void 0 : _6.name);
    return {
        key: {
            remoteJid: (_7 = message === null || message === void 0 ? void 0 : message.key) === null || _7 === void 0 ? void 0 : _7.remoteJid,
            fromMe: (_8 = message === null || message === void 0 ? void 0 : message.key) === null || _8 === void 0 ? void 0 : _8.fromMe,
            id: (_9 = message === null || message === void 0 ? void 0 : message.key) === null || _9 === void 0 ? void 0 : _9.id,
            participant: (_10 = message === null || message === void 0 ? void 0 : message.key) === null || _10 === void 0 ? void 0 : _10.participant,
        },
        jid: (_11 = message === null || message === void 0 ? void 0 : message.key) === null || _11 === void 0 ? void 0 : _11.remoteJid,
        owner: (0, src_1.toJid)((_12 = client === null || client === void 0 ? void 0 : client.user) === null || _12 === void 0 ? void 0 : _12.id),
        pushName: message === null || message === void 0 ? void 0 : message.pushName,
        messageTimestamp: (_13 = message === null || message === void 0 ? void 0 : message.messageTimestamp) !== null && _13 !== void 0 ? _13 : Date.now(),
        message: msg,
        type: type,
        device: (0, resources_1.getDevice)((_14 = message === null || message === void 0 ? void 0 : message.key) === null || _14 === void 0 ? void 0 : _14.remoteJid),
        sender,
        prefix,
        mod: mode,
        ban: bannedusers.includes(sender),
        sudo: sender === owner || sudo.includes(sender),
        text: mBody,
        quoted: quoted && quotedMessage
            ? {
                key: {
                    remoteJid: (quoted === null || quoted === void 0 ? void 0 : quoted.remoteJid) || message.key.remoteJid,
                    fromMe: quoted.participant === owner,
                    id: quoted.stanzaId,
                    participant: isGroup ? quoted.participant : undefined,
                },
                message: quotedMessage,
                type: quotedType,
                sender: quoted.participant,
                device: (0, resources_1.getDevice)(quoted.stanzaId),
                ban: bannedusers.includes(quoted.participant),
                sudo: quoted.participant === owner || sudo.includes(quoted.participant),
                text: qBody,
                image: quotedType === 'imageMessage',
                video: quotedType === 'videoMessage',
                audio: quotedType === 'audioMessage',
                document: quotedType === 'documentMessage',
                viewonce: ((_15 = quotedMessage === null || quotedMessage === void 0 ? void 0 : quotedMessage.imageMessage) === null || _15 === void 0 ? void 0 : _15.viewOnce) || ((_16 = quotedMessage === null || quotedMessage === void 0 ? void 0 : quotedMessage.videoMessage) === null || _16 === void 0 ? void 0 : _16.viewOnce) || ((_17 = quotedMessage === null || quotedMessage === void 0 ? void 0 : quotedMessage.audioMessage) === null || _17 === void 0 ? void 0 : _17.viewOnce),
            }
            : undefined,
        send: async function (content, options) {
            if (!content)
                return;
            const type = await (0, src_1.detectType)(content);
            if (type === 'text') {
                const message = await client.sendMessage(this.jid, { text: content.toString(), ...options }, { ...options });
                return serialize(message, client);
            }
            else if (type === 'video') {
                const message = await client.sendMessage(this.jid, { video: content, ...options }, { ...options });
                return serialize(message, client);
            }
            else if (type === 'image') {
                const message = await client.sendMessage(this.jid, { image: content, ...options }, { ...options });
                return serialize(message, client);
            }
            else if (type === 'sticker') {
                const message = await client.sendMessage(this.jid, { sticker: content, ...options }, { ...options });
                return serialize(message, client);
            }
        },
        edit: async function (content) {
            var _a;
            const key = ((_a = this === null || this === void 0 ? void 0 : this.quoted) === null || _a === void 0 ? void 0 : _a.key) || (this === null || this === void 0 ? void 0 : this.key);
            const msg = await client.sendMessage(this.jid, {
                text: content,
                edit: key,
            });
            return serialize(msg, client);
        },
        forward: async (jid, message, opts = {}) => {
            if (!jid || !message)
                throw new Error('No jid or message provided');
            return await client.sendMessage(jid, { forward: message, contextInfo: { ...opts }, ...opts }, { ...opts });
        },
        reply: async function (text) {
            const msg = await client.sendMessage(this.jid, { text: text.toString() });
            return serialize(msg, client);
        },
        downloadM: async (message, file = false) => {
            return await (0, src_1.downloadMessage)(message, file);
        },
        delete: async function () {
            var _a;
            const key = ((_a = this === null || this === void 0 ? void 0 : this.quoted) === null || _a === void 0 ? void 0 : _a.key) || this.key;
            const msg = await client.sendMessage(this.jid, {
                delete: key,
            });
            return serialize(msg, client);
        },
        react: async function (emoji) {
            var _a;
            const key = ((_a = this === null || this === void 0 ? void 0 : this.quoted) === null || _a === void 0 ? void 0 : _a.key) || this.key;
            const msg = await client.sendMessage(this.jid, {
                react: {
                    text: emoji,
                    key: key,
                },
            });
            return serialize(msg, client);
        },
        user: async (match) => {
            var _a;
            if (match)
                return (0, src_1.toJid)(match);
            if (quoted.participant)
                quoted.participant;
            if (isGroup && ((_a = quoted === null || quoted === void 0 ? void 0 : quoted.mentionedJid) === null || _a === void 0 ? void 0 : _a[0]))
                return quoted.mentionedJid[0];
            if (!isGroup && message.key.remoteJid)
                return message.key.remoteJid;
            return false;
        },
    };
}
