import { AuthenticationState } from '../Types';
export declare const useSQLiteAuthState: (dbPath: string) => Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
}>;
