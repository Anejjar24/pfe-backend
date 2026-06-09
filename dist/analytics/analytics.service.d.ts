import { DataSource, Repository } from 'typeorm';
import { Alert, AlertStatus, AlertType } from '../database/entities/Alert.entity';
import { Maintenance } from '../database/entities/Maintenance.entity';
import { Sensor, SensorStatus } from '../database/entities/Sensor.entity';
import { SensorAggregate } from '../database/entities/SensorAggregate.entity';
import { SensorData } from '../database/entities/SensorData.entity';
import { Station } from '../database/entities/Station.entity';
import { HistoryGranularity, SensorStatsQueryDto, StationHistoryQueryDto } from './dto/analytics-query.dto';
export declare class AnalyticsService {
    private readonly dataSource;
    private readonly stationRepo;
    private readonly sensorRepo;
    private readonly alertRepo;
    private readonly maintenanceRepo;
    private readonly sensorDataRepo;
    private readonly aggregateRepo;
    private readonly logger;
    constructor(dataSource: DataSource, stationRepo: Repository<Station>, sensorRepo: Repository<Sensor>, alertRepo: Repository<Alert>, maintenanceRepo: Repository<Maintenance>, sensorDataRepo: Repository<SensorData>, aggregateRepo: Repository<SensorAggregate>);
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
    getStationStatus(): Promise<{
        id: string;
        name: string;
        status: string;
        location: string;
        type: string;
        totalSensors: number;
        activeSensors: number;
        offlineSensors: number;
        faultySensors: number;
        openAlerts: number;
        lastReadingAt: string;
    }[]>;
    getAnomalyTimeline(hours?: number, limit?: number): Promise<{
        id: string;
        type: AlertType;
        severity: import("../database/entities/Alert.entity").AlertSeverity;
        status: AlertStatus;
        message: string;
        createdAt: Date;
        zScore: any;
        rollingMean: any;
        rollingStddev: any;
        value: any;
        station: {
            id: string;
            name: string;
        } | null;
        sensor: {
            id: string;
            name: string;
            unit: string;
            type: import("../database/entities/Sensor.entity").SensorType;
        } | null;
    }[]>;
    getNetworkTrend(hours?: number): Promise<{
        time: string;
        avgValue: number;
        readingCount: number;
    }[]>;
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
            granularity: HistoryGranularity;
            interval: string;
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
            stddev: number | null;
            count: number;
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
            granularity: HistoryGranularity;
            interval: string;
        };
        sensors: {
            sensorId: string;
            sensorName: string;
            unit: string;
            buckets: unknown[];
        }[];
    } | null>;
    getSystemMetrics(hours?: number): Promise<{
        windowHours: number;
        from: Date;
        totalReadings: number;
        source: string;
        topSensors: {
            sensorId: string;
            totalReadings: number;
            avgValue: number;
        }[];
    }>;
    getKpis(granularity?: 'hourly' | 'daily', hours?: number): Promise<{
        granularity: "hourly" | "daily";
        windowHours: number;
        from: Date;
        totalBuckets: number;
        totalAnomalies: number;
        anomalyByStation: Record<string, number>;
        rows: {
            sensorId: string;
            stationId: string;
            bucket: string;
            avgValue: number | null;
            minValue: number | null;
            maxValue: number | null;
            stddevValue: number | null;
            readingCount: number;
            anomalyFlag: boolean;
            rollingMean: number | null;
            rollingStddev: number | null;
        }[];
    }>;
    private querySensorBuckets;
    private querySensorHourlyView;
    private querySensorDailyView;
    private queryStationBuckets;
    private queryStationHourlyView;
    private queryStationDailyView;
}
