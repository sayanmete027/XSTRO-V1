import { GroupMetadata } from '../Types';
export declare const saveGroupMetadata: (jid: string, metadata: GroupMetadata) => Promise<void>;
export declare const groupMetadata: (jid: string) => Promise<GroupMetadata | null>;
export declare const deleteGroupMetadata: (jid: string) => Promise<void>;
