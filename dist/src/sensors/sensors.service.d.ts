import { Repository } from 'typeorm';
import { Cache } from '@nestjs/cache-manager';
import { Sensor } from '../database/entities/Sensor.entity';
import { SensorData } from '../database/entities/SensorData.entity';
import { Station } from '../database/entities/Station.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { SensorQueryDto } from './dto/sensor-query.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { RealtimeService } from '../realtime/realtime.service';
export declare class SensorsService {
    private readonly sensorRepository;
    private readonly sensorDataRepository;
    private readonly stationRepository;
    private readonly cacheManager;
    private readonly realtimeService?;
    private readonly listCacheKeys;
    constructor(sensorRepository: Repository<Sensor>, sensorDataRepository: Repository<SensorData>, stationRepository: Repository<Station>, cacheManager: Cache, realtimeService?: RealtimeService | undefined);
    create(dto: CreateSensorDto): Promise<Sensor>;
    findAll(query: SensorQueryDto): Promise<{
        data: Sensor[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<Sensor>;
    update(id: string, dto: UpdateSensorDto): Promise<Sensor>;
    remove(id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    findData(sensorId: string, limit?: number): Promise<SensorData[]>;
    injectReading(sensorId: string, value: number): Promise<{
        sensorId: string;
        name: string;
        value: number;
        unit: string;
        timestamp: Date;
        status: import("../database/entities/Sensor.entity").SensorStatus;
        station: {
            id: string;
            name: string;
        } | null;
    }>;
    exportDataCsv(sensorId: string, limit: number, from?: string, to?: string): Promise<string>;
    private clearListCache;
}
