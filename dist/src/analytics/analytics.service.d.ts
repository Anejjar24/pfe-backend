import { Repository } from 'typeorm';
import { Alert } from '../database/entities/Alert.entity';
import { Maintenance } from '../database/entities/Maintenance.entity';
import { Sensor, SensorStatus } from '../database/entities/Sensor.entity';
import { SensorData } from '../database/entities/SensorData.entity';
import { Station } from '../database/entities/Station.entity';
import { SensorStatsQueryDto, StationHistoryQueryDto } from './dto/analytics-query.dto';
export declare class AnalyticsService {
    private readonly stationRepo;
    private readonly sensorRepo;
    private readonly alertRepo;
    private readonly maintenanceRepo;
    private readonly sensorDataRepo;
    constructor(stationRepo: Repository<Station>, sensorRepo: Repository<Sensor>, alertRepo: Repository<Alert>, maintenanceRepo: Repository<Maintenance>, sensorDataRepo: Repository<SensorData>);
    getOverview(): Promise<{
        totalStations: number;
        activeSensors: number;
        openAlerts: number;
        maintenancePending: number;
        stationsByStatus: {
            status: string;
            count: number;
        }[];
        alertsBySeverity: {
            severity: string;
            count: number;
        }[];
    }>;
    getSensorStats(sensorId: string, query: SensorStatsQueryDto): Promise<{
        sensor: {
            id: string;
            name: string;
            unit: string;
            type: import("../database/entities/Sensor.entity").SensorType;
            status: SensorStatus;
            minThreshold: number;
            maxThreshold: number;
            station: {
                id: string;
                name: string;
            } | null;
        };
        period: {
            from: Date;
            to: Date;
        };
        stats: {
            avg: number | null;
            min: number | null;
            max: number | null;
            count: number;
            stddev: number | null;
        };
        timeSeries: {
            time: string;
            avg: number;
            min: number;
            max: number;
        }[];
    } | null>;
    getStationHistory(stationId: string, query: StationHistoryQueryDto): Promise<{
        station: {
            id: string;
            name: string;
            status: import("../database/entities/Station.entity").StationStatus;
        };
        period: {
            from: Date;
            to: Date;
            granularity: string;
        };
        sensors: {
            sensorId: string;
            sensorName: string;
            unit: string;
            buckets: unknown[];
        }[];
    } | null>;
}
