import { KafkaConsumerService } from '../iot/kafka/kafka.consumer.service';
import { AnalyticsService } from './analytics.service';
import { SensorStatsQueryDto, StationHistoryQueryDto } from './dto/analytics-query.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    private readonly kafkaConsumer;
    constructor(analyticsService: AnalyticsService, kafkaConsumer: KafkaConsumerService);
    getPipelineStats(): {
        consumerRunning: boolean;
        readingsConsumed: number;
        anomaliesConsumed: number;
        lastReadingAt: string | null;
        lastAnomalyAt: string | null;
        consumerGroupId: string;
    };
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
    getSystemMetrics(hours?: number): Promise<{
        windowHours: number;
        from: Date;
        totalReadings: number;
        topSensors: {
            sensorId: string;
            totalReadings: number;
            avgValue: number;
        }[];
    }>;
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
            granularity: import("./dto/analytics-query.dto").HistoryGranularity;
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
            granularity: import("./dto/analytics-query.dto").HistoryGranularity;
            interval: string;
        };
        sensors: {
            sensorId: string;
            sensorName: string;
            unit: string;
            buckets: unknown[];
        }[];
    }>;
}
