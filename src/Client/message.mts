import { Client, ContentType, extractTextFromMessage, getConfig, getDataType, numToJid, sendMessageOptionals } from "#default";
import { AnyMessageContent, downloadMediaMessage, getContentType, isJidBroadcast, isJidGroup, normalizeMessageContent, WAContextInfo, WAMessage } from "baileys";
import { writeFile } from "fs/promises";

export async function Message(client: Client, messages: WAMessage) {
    const normalizedMessages = {
        ...messages,
        message: normalizeMessageContent(messages.message),
    };
    const { key, message, ...msg } = normalizedMessages;
    const { user, sendMessage } = client;
    const { prefix } = await getConfig();
    const owner = numToJid(user!.id);
    const mtype = getContentType(message);
    function hasContextInfo(msg: any): msg is { contextInfo: WAContextInfo } {
        return msg && "contextInfo" in msg && typeof msg !== "string";
    }
    const messageContent = message?.[mtype!];
    const Quoted = hasContextInfo(messageContent) ? messageContent.contextInfo : undefined;
    const quotedM = Quoted ? normalizeMessageContent(Quoted!.quotedMessage) : undefined;

    return {
        key,
        message,
        mtype,
        jid: key.remoteJid!,
        owner: owner,
        prefix,
        sender: isJidGroup(key.remoteJid!) || isJidBroadcast(key.remoteJid!) ? key.participant! : key.remoteJid!,
        text: extractTextFromMessage(message!),
        quoted:
            Quoted && quotedM
                ? {
                      key: {
                          remoteJid: key.remoteJid,
                          fromMe: Quoted.participant === owner,
                          id: Quoted.stanzaId,
                          participant: isJidGroup(key.remoteJid!) || isJidBroadcast(key.remoteJid!) ? Quoted.participant : undefined,
                      },
                      message: quotedM,
                      type: getContentType(quotedM),
                      sender: Quoted.participant!,
                      text: extractTextFromMessage(quotedM),
                      broadcast: Boolean(Quoted.remoteJid!),
                      ...(({ quotedMessage, stanzaId, remoteJid, ...rest }) => rest)(Quoted),
                  }
                : undefined,
        send: async function (content: ContentType, options: Partial<sendMessageOptionals> = {}) {
            const jid = options.jid ?? this.jid;
            const type = options.type as "text" | "audio" | "image" | "video" | "sticker" | "document" | undefined;
            const atype = await getDataType(content);

            const getMessageContent = async (): Promise<AnyMessageContent> => {
                if (!type) {
                    const { mimeType, contentType } = atype;
                    switch (contentType) {
                        case "text":
                            return { text: content.toString() };
                        case "image":
                            return { image: Buffer.from(content) };
                        case "audio":
                            return { audio: Buffer.from(content) };
                        case "video":
                            return { video: Buffer.from(content) };
                        case "sticker":
                            return { sticker: Buffer.from(content) };
                        case "document":
                            return {
                                document: Buffer.from(content),
                                mimetype: mimeType || "application/octet-stream",
                            };
                        default:
                            throw new Error(`Unsupported auto-detected content type: ${contentType}`);
                    }
                }

                switch (type) {
                    case "text":
                        return { text: content.toString(), ...options };
                    case "image":
                        return { image: Buffer.from(content), ...options };
                    case "audio":
                        return { audio: Buffer.from(content), ptt: options.ptt, ...options };
                    case "video":
                        return {
                            video: Buffer.from(content),
                            ptv: options.ptv,
                            gifPlayback: options.gifPlayback,
                            caption: options.caption,
                            ...options,
                        };
                    case "sticker":
                        return { sticker: Buffer.from(content), ...options };
                    case "document":
                        return {
                            document: Buffer.from(content),
                            mimetype: options.mimetype || atype.mimeType || "application/octet-stream",
                            fileName: options.fileName,
                            caption: options.caption,
                            ...options,
                        };
                    default:
                        throw new Error(`Unsupported explicit type: ${type}`);
                }
            };

            const messageContent = await getMessageContent();
            const m = await sendMessage(jid!, messageContent, { ...options });
            return Message(client, m!);
        },
        edit: async function (text: string) {
            const key = this.quoted ? this.quoted.key : this.key;
            const msg = await client.sendMessage(this.jid, {
                text: text,
                edit: key,
            });
            return Message(client, msg!);
        },
        downloadM: async function (message: WAMessage, shouldSaveasFile?: boolean) {
            const media = await downloadMediaMessage(message, "buffer", {});
            if (shouldSaveasFile) {
                return await writeFile(message.key.id!, media);
            }
            return media;
        },
        ...msg,
        ...(({ logger, ws, authState, signalRepository, user, ...rest }) => rest)(client),
    };
}

export type MessageType = ReturnType<typeof Message> extends Promise<infer T> ? T : never;
