import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlertsService } from '../../alerts/alerts.service';
import { SensorReadingMessage } from './kafka.producer.service';
export declare const TOPIC_SENSOR_ANOMALIES = "sensors.anomalies";
export interface AnomalyMessage {
    sensorId: string;
    stationId?: string;
    type: string;
    value: number;
    unit: string;
    timestamp: string;
    zScore: number;
    rollingMean: number;
    rollingStddev: number;
    windowMinutes: number;
}
export interface PipelineStats {
    readingsConsumed: number;
    anomaliesConsumed: number;
    lastReadingAt: string | null;
    lastAnomalyAt: string | null;
    consumerGroupId: string;
}
export type ReadingHandler = (msg: SensorReadingMessage) => Promise<void> | void;
export declare class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly alertsService;
    private readonly logger;
    private consumer;
    private running;
    private stats;
    private readonly readingHandlers;
    constructor(configService: ConfigService, alertsService: AlertsService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    registerReadingHandler(handler: ReadingHandler): void;
    getPipelineStats(): PipelineStats;
    getIsRunning(): boolean;
    private handleMessage;
    private onSensorReading;
    private onSensorAnomaly;
}
