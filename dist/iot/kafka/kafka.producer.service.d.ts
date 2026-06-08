import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface SensorReadingMessage {
    sensorId: string;
    stationId: string | undefined;
    type: string;
    value: number;
    unit: string;
    timestamp: string;
    thresholdViolated: boolean;
}
export declare const TOPIC_SENSOR_READINGS = "sensors.readings";
export declare class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private producer;
    private connected;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    publishSensorReading(message: SensorReadingMessage): Promise<void>;
}
