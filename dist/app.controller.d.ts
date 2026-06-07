import { Cache } from '@nestjs/cache-manager';
import { Response } from 'express';
import { DatabaseService } from './database/database.service';
export declare class AppController {
    private readonly databaseService;
    private readonly cacheManager;
    constructor(databaseService: DatabaseService, cacheManager: Cache);
    health(res: Response): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        db: {
            status: string;
        };
        redis: {
            status: string;
        };
    }>;
    private checkRedis;
}
