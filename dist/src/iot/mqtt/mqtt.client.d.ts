import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IotService } from '../iot.service';
export declare class MqttClient implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly iotService;
    private readonly logger;
    private client?;
    private isConnected;
    private readonly externalHandlers;
    constructor(configService: ConfigService, iotService: IotService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private subscribeToTopics;
    registerHandler(handler: (topic: string, payload: Buffer) => void): void;
    private handleMessage;
    publish(topic: string, message: any): Promise<void>;
    subscribe(topic: string, callback: (topic: string, payload: Buffer) => void): void;
    getIsConnected(): boolean;
}
