import { Client, ContentType, getDataType, sendMessageOptionals } from "#default";
import { AnyMessageContent, WAMessage } from "baileys";

export async function Message(client: Client, messages: WAMessage) {
    const { key, message, ...msg } = messages;
    const { user, sendMessage } = client;

    return {
        key,
        message,
        jid: key.remoteJid!,
        send: async function (content: ContentType, options: Partial<sendMessageOptionals> = {}) {
            const jid = options.jid;
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
        // ...msg,
    };
}