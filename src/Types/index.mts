import { WASocket } from "baileys";

export type BOTINFO = {
    name: string;
    version: number;
    created: Date;
    attrbuites: string[]
}

export type Client = WASocket