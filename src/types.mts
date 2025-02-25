import { WAProto, WASocket, GroupMetadata, WAMessage } from "baileys";
export interface ParticipantActivity {
    pushName: string | null;
    messageCount: number;
    participant: string;
}
export interface Command {
    name: RegExp | string;
    function?: Function;
    fromMe?: boolean;
    isGroup?: boolean;
    desc: string | undefined;
    type: Category;
    dontAddCommandList?: boolean;
}

type Category = "misc" | "system" | "settings" | "tools" | "whatsapp" | "group" | "news";

export interface DataType {
    contentType: "text" | "audio" | "image" | "video" | "sticker" | "document";
    mimeType: string;
}

export type BOTINFO = {
    name: string;
    version: number;
    created: Date;
    attrbuites: string[];
};

export type Config = {
    prefix: string[];
    mode: boolean;
    autoRead: boolean;
    autoStatusRead: boolean;
    autolikestatus: boolean;
    disablegc: boolean;
    disabledm: boolean;
    cmdReact: boolean;
    cmdRead: boolean;
    savebroadcast: boolean;
    disabledCmds: string[];
    sudo: string[];
    bannedusers: string[];
};

export type sendMessageOptionals = {
    jid: string;
    contextInfo?: WAProto.IContextInfo;
    mentions?: string[];
    type?: "text" | "audio" | "image" | "video" | "sticker" | "document";
    mimetype?: string;
    disappearingMessagesInChat?: boolean | number;
    fileName?: string;
    ptt?: boolean;
    ptv?: boolean;
    caption?: string;
    gifPlayback?: boolean;
    quoted?: WAMessage;
    ephemeralExpiration?: number | string;
};

export interface MediaTypeInfo {
    mimeType: string;
    contentType: "text" | "audio" | "image" | "video" | "sticker" | "document";
}
export type sendTypes = "text" | "audio" | "image" | "video" | "sticker" | "document";
export type Client = WASocket;
export type MediaMessageType = "imageMessage" | "videoMessage" | "audioMessage" | "documentMessage";
export type GroupData = GroupMetadata;
export type ContentType = Buffer | string;
