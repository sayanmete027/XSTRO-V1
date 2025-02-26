import { WAProto, WASocket, GroupMetadata, WAMessage } from "baileys";

// WhatsApp Core Types
export type Client = WASocket;
export type GroupData = GroupMetadata;

// Message Content Types
export type sendTypes = "text" | "audio" | "image" | "video" | "sticker" | "document";
export type MediaMessageType = "imageMessage" | "videoMessage" | "audioMessage" | "documentMessage";
export type ContentType = Buffer | string;
export type Category = "misc" | "system" | "settings" | "tools" | "whatsapp" | "group" | "news" | "chats";

// Data Structures
export interface DataType {
    contentType: sendTypes;
    mimeType: string;
}

export interface MediaTypeInfo {
    mimeType: string;
    contentType: sendTypes;
}

// Command System
export interface Command {
    name: RegExp | string;
    function?: Function;
    fromMe?: boolean;
    isGroup?: boolean;
    desc: string | undefined;
    type: Category;
    dontAddCommandList?: boolean;
}

export interface PluginConfig {
    paths?: string | string[];
    shouldMerge?: boolean;
    extensions?: string[];
}

export interface SystemConfig {
    bot_name: string;
    owner: string;
}

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
    banned: string[];
};

// Message Sending
export interface sendMessageOptionals {
    jid: string;
    contextInfo?: WAProto.IContextInfo;
    mentions?: string[];
    type?: sendTypes;
    mimetype?: string;
    disappearingMessagesInChat?: boolean | number;
    fileName?: string;
    ptt?: boolean;
    ptv?: boolean;
    caption?: string;
    gifPlayback?: boolean;
    quoted?: WAMessage;
    ephemeralExpiration?: number | string;
}

// Group Activity
export interface ParticipantActivity {
    pushName: string | null;
    messageCount: number;
    participant: string;
}

// News/Article Structure
export interface Article {
    title: string;
    description: string;
    link: string;
}
