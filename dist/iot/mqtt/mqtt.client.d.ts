import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MqttClient implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private client?;
    private isConnected;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private subscribeToTopics;
    private handleMessage;
    publish(topic: string, message: any): Promise<void>;
    subscribe(topic: string, callback: (topic: string, payload: Buffer) => void): void;
    getIsConnected(): boolean;
}
