"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const alerts_service_1 = require("../../alerts/alerts.service");
const kafka_consumer_service_1 = require("./kafka.consumer.service");
const kafka_producer_service_1 = require("./kafka.producer.service");
const Alert_entity_1 = require("../../database/entities/Alert.entity");
let capturedEachMessage;
const mockRun = jest.fn().mockImplementation(async ({ eachMessage }) => {
    capturedEachMessage = eachMessage;
});
const mockConsumerConnect = jest.fn();
const mockConsumerSubscribe = jest.fn();
const mockConsumerDisconnect = jest.fn();
const mockConsumer = {
    connect: mockConsumerConnect,
    subscribe: mockConsumerSubscribe,
    run: mockRun,
    disconnect: mockConsumerDisconnect,
};
jest.mock('kafkajs', () => ({
    Kafka: jest.fn().mockImplementation(() => ({
        consumer: jest.fn().mockReturnValue(mockConsumer),
    })),
}));
const mockAlertsService = () => ({
    create: jest.fn().mockResolvedValue({ id: 'alert-1' }),
});
const makeReading = (overrides = {}) => ({
    sensorId: 'sensor-1',
    stationId: 'station-1',
    type: 'pressure',
    value: 42,
    unit: 'bar',
    timestamp: new Date().toISOString(),
    thresholdViolated: false,
    ...overrides,
});
const makeAnomaly = (overrides = {}) => ({
    sensorId: 'sensor-1',
    stationId: 'station-1',
    type: 'pressure',
    value: 99,
    unit: 'bar',
    timestamp: new Date().toISOString(),
    zScore: 3.5,
    rollingMean: 42,
    rollingStddev: 5,
    windowMinutes: 5,
    ...overrides,
});
const makeKafkaMessage = (topic, payload) => ({
    topic,
    partition: 0,
    message: {
        offset: '0',
        value: Buffer.from(JSON.stringify(payload)),
    },
});
describe('KafkaConsumerService', () => {
    let service;
    let alertsService;
    beforeEach(async () => {
        jest.clearAllMocks();
        capturedEachMessage = undefined;
        mockConsumerConnect.mockResolvedValue(undefined);
        mockConsumerSubscribe.mockResolvedValue(undefined);
        mockConsumerDisconnect.mockResolvedValue(undefined);
        const module = await testing_1.Test.createTestingModule({
            providers: [
                kafka_consumer_service_1.KafkaConsumerService,
                {
                    provide: config_1.ConfigService,
                    useValue: { get: jest.fn().mockReturnValue('kafka:9092') },
                },
                { provide: alerts_service_1.AlertsService, useFactory: mockAlertsService },
            ],
        }).compile();
        service = module.get(kafka_consumer_service_1.KafkaConsumerService);
        alertsService = module.get(alerts_service_1.AlertsService);
        await service.onModuleInit();
    });
    describe('onModuleInit', () => {
        it('subscribes to both sensor topics', () => {
            expect(mockConsumerSubscribe).toHaveBeenCalledWith(expect.objectContaining({
                topics: expect.arrayContaining([kafka_producer_service_1.TOPIC_SENSOR_READINGS, kafka_consumer_service_1.TOPIC_SENSOR_ANOMALIES]),
            }));
        });
        it('sets running=true after successful init', () => {
            expect(service.getIsRunning()).toBe(true);
        });
        it('stays offline when KAFKA_BROKERS is not set', async () => {
            const module2 = await testing_1.Test.createTestingModule({
                providers: [
                    kafka_consumer_service_1.KafkaConsumerService,
                    {
                        provide: config_1.ConfigService,
                        useValue: { get: jest.fn().mockReturnValue(undefined) },
                    },
                    { provide: alerts_service_1.AlertsService, useFactory: mockAlertsService },
                ],
            }).compile();
            const svc2 = module2.get(kafka_consumer_service_1.KafkaConsumerService);
            await svc2.onModuleInit();
            expect(svc2.getIsRunning()).toBe(false);
        });
    });
    describe('getPipelineStats', () => {
        it('starts with zero counts', () => {
            const stats = service.getPipelineStats();
            expect(stats.readingsConsumed).toBe(0);
            expect(stats.anomaliesConsumed).toBe(0);
            expect(stats.lastReadingAt).toBeNull();
            expect(stats.lastAnomalyAt).toBeNull();
        });
        it('increments readingsConsumed when a sensor reading arrives', async () => {
            await capturedEachMessage(makeKafkaMessage(kafka_producer_service_1.TOPIC_SENSOR_READINGS, makeReading()));
            expect(service.getPipelineStats().readingsConsumed).toBe(1);
        });
        it('increments anomaliesConsumed when an anomaly message arrives', async () => {
            await capturedEachMessage(makeKafkaMessage(kafka_consumer_service_1.TOPIC_SENSOR_ANOMALIES, makeAnomaly()));
            expect(service.getPipelineStats().anomaliesConsumed).toBe(1);
        });
    });
    describe('registerReadingHandler', () => {
        it('calls registered handler when a reading is received', async () => {
            const handler = jest.fn().mockResolvedValue(undefined);
            service.registerReadingHandler(handler);
            const reading = makeReading({ value: 77 });
            await capturedEachMessage(makeKafkaMessage(kafka_producer_service_1.TOPIC_SENSOR_READINGS, reading));
            expect(handler).toHaveBeenCalledWith(expect.objectContaining({ value: 77 }));
        });
        it('continues processing even when a registered handler throws', async () => {
            service.registerReadingHandler(jest.fn().mockRejectedValue(new Error('handler crash')));
            await expect(capturedEachMessage(makeKafkaMessage(kafka_producer_service_1.TOPIC_SENSOR_READINGS, makeReading()))).resolves.toBeUndefined();
        });
    });
    describe('anomaly alert creation', () => {
        it('creates an alert when anomaly message is received', async () => {
            await capturedEachMessage(makeKafkaMessage(kafka_consumer_service_1.TOPIC_SENSOR_ANOMALIES, makeAnomaly()));
            expect(alertsService.create).toHaveBeenCalledWith(expect.objectContaining({
                type: Alert_entity_1.AlertType.ANOMALY,
                sourceSystem: 'spark-streaming',
            }));
        });
        it('assigns WARNING severity for z-score between 2.5 and 3', async () => {
            await capturedEachMessage(makeKafkaMessage(kafka_consumer_service_1.TOPIC_SENSOR_ANOMALIES, makeAnomaly({ zScore: 2.7 })));
            expect(alertsService.create).toHaveBeenCalledWith(expect.objectContaining({ severity: Alert_entity_1.AlertSeverity.WARNING }));
        });
        it('assigns ERROR severity for z-score between 3 and 4', async () => {
            await capturedEachMessage(makeKafkaMessage(kafka_consumer_service_1.TOPIC_SENSOR_ANOMALIES, makeAnomaly({ zScore: 3.5 })));
            expect(alertsService.create).toHaveBeenCalledWith(expect.objectContaining({ severity: Alert_entity_1.AlertSeverity.ERROR }));
        });
        it('assigns CRITICAL severity for z-score >= 4', async () => {
            await capturedEachMessage(makeKafkaMessage(kafka_consumer_service_1.TOPIC_SENSOR_ANOMALIES, makeAnomaly({ zScore: 4.2 })));
            expect(alertsService.create).toHaveBeenCalledWith(expect.objectContaining({ severity: Alert_entity_1.AlertSeverity.CRITICAL }));
        });
        it('does not rethrow when alertsService.create fails', async () => {
            alertsService.create.mockRejectedValue(new Error('DB down'));
            await expect(capturedEachMessage(makeKafkaMessage(kafka_consumer_service_1.TOPIC_SENSOR_ANOMALIES, makeAnomaly()))).resolves.toBeUndefined();
        });
    });
    describe('malformed messages', () => {
        it('does nothing when message.value is null', async () => {
            await expect(capturedEachMessage({ topic: kafka_producer_service_1.TOPIC_SENSOR_READINGS, partition: 0, message: { value: null } })).resolves.toBeUndefined();
            expect(alertsService.create).not.toHaveBeenCalled();
        });
        it('does not throw on invalid JSON', async () => {
            await expect(capturedEachMessage({
                topic: kafka_producer_service_1.TOPIC_SENSOR_READINGS,
                partition: 0,
                message: { value: Buffer.from('not-json') },
            })).resolves.toBeUndefined();
        });
    });
    describe('onModuleDestroy', () => {
        it('disconnects consumer on module destroy', async () => {
            await service.onModuleDestroy();
            expect(mockConsumerDisconnect).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=kafka.consumer.service.spec.js.map