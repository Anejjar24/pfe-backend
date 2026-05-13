export declare class PasswordUtil {
    private readonly saltRounds;
    hashPassword(password: string): Promise<string>;
    comparePasswords(password: string, hash: string): Promise<boolean>;
    generateTemporaryPassword(length?: number): string;
}
