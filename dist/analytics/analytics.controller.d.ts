import { KafkaConsumerService } from '../iot/kafka/kafka.consumer.service';
import { AnalyticsService } from './analytics.service';
import { SensorStatsQueryDto, StationHistoryQueryDto } from './dto/analytics-query.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    private readonly kafkaConsumer;
    constructor(analyticsService: AnalyticsService, kafkaConsumer: KafkaConsumerService);
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
        type: import("../database/entities/Alert.entity").AlertType;
        severity: import("../database/entities/Alert.entity").AlertSeverity;
        status: import("../database/entities/Alert.entity").AlertStatus;
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
    getDataFreshness(): {
        lastReadingAt: string | null;
        lastAnomalyAt: string | null;
        totalMeasurements: number;
        totalAnomalies: number;
        monitoringActive: boolean;
    };
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
        source: string;
        topSensors: {
            sensorId: string;
            totalReadings: number;
            avgValue: number;
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
