import { AuthenticationState } from '../Types';
export declare const useSQLiteAuthState: (database: string) => Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
}>;
