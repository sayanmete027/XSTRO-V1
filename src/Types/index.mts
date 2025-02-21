import { AnyMediaMessageContent, AnyMessageContent, AnyRegularMessageContent, WAProto, WASocket, GroupMetadata } from "baileys";

export interface Command {
    name: RegExp | string;
    function?: Function;
    fromMe?: boolean;
    isGroup?: boolean;
    desc: string | undefined;
    type: CommandCategories;
    dontAddCommandList?: boolean;
}

export type CommandCategories = {
    misc: undefined;
    system: string;
    settings: string;
    tools: string;
    whatsapp: string;
};

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

export type Client = WASocket;
export type MediaMessageType = "imageMessage" | "videoMessage" | "audioMessage" | "documentMessage";
export type sendMessageOptionals = WAProto.ContextInfo | AnyMessageContent | AnyMediaMessageContent | AnyRegularMessageContent;
export type GroupData = GroupMetadata;
