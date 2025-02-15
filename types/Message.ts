import { WAProto } from '../resources';

export interface Message {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
        participant?: string | undefined;
    };
    jid: string;
    pushName: string | null | undefined;
    messageTimestamp: number;
    owner: string;
    message: WAProto.IMessage | undefined;
    type: string;
    device: string;
    sender: string | null | undefined;
    prefix: [string];
    mod: boolean;
    ban: boolean;
    sudo: boolean;
    text: string | null | undefined;
    quoted?: {
        key: {
            remoteJid: string;
            fromMe: boolean;
            id: string;
            participant?: string | undefined;
        };
        message: WAProto.IMessage | undefined,
        type: string | undefined;
        sender: string | undefined;
        device: string;
        ban: boolean;
        sudo: boolean;
        text: string | null | undefined;
        image: boolean;
        video: boolean;
        audio: boolean;
        document: boolean;
        viewonce: boolean;
    };
    send: (content: Buffer | string, options?: any) => Promise<Message | any>;
    edit: (content: string) => Promise<Message>;
    forward: (jid: string, message: any, opts?: any) => Promise<any>;
    reply: (text: string) => Promise<Message>;
    downloadM: (message: any, file?: boolean) => Promise<ArrayBuffer | any>;
    delete: () => Promise<Message>;
    react: (emoji: string) => Promise<Message>;
    user: (match: string) => Promise<string | false>;
}