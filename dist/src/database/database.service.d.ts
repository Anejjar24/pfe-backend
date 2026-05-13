import { DataSource } from 'typeorm';
export declare class DatabaseService {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    healthCheck(): Promise<boolean>;
    getStats(): Promise<Record<string, any>>;
    query(sql: string, parameters?: any[]): Promise<any[]>;
    isConnected(): boolean;
    close(): Promise<void>;
}
