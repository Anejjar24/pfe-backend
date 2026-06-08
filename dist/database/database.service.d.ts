import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class DatabaseService implements OnModuleInit {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
    private verifyTimescaleDb;
    private setupHypertables;
    private convertSensorDataToHypertable;
    getHypertableInfo(): Promise<Record<string, any> | null>;
    healthCheck(): Promise<boolean>;
    getTimescaleVersion(): Promise<string | null>;
    getStats(): Promise<Record<string, any>>;
    query(sql: string, parameters?: any[]): Promise<any[]>;
    isConnected(): boolean;
    close(): Promise<void>;
}
