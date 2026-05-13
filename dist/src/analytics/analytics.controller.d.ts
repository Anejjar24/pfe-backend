import { AnalyticsService } from './analytics.service';
import { SensorStatsQueryDto, StationHistoryQueryDto } from './dto/analytics-query.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
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
    getSensorStats(id: string, query: SensorStatsQueryDto): Promise<{
        sensor: {
            id: string;
            name: string;
            unit: string;
            type: import("../database/entities/Sensor.entity").SensorType;
            status: import("../database/entities/Sensor.entity").SensorStatus;
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
    }>;
    getStationHistory(id: string, query: StationHistoryQueryDto): Promise<{
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
    }>;
}
