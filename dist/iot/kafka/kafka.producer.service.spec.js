"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const kafka_producer_service_1 = require("./kafka.producer.service");
const mockSend = jest.fn();
const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockProducer = {
    connect: mockConnect,
    send: mockSend,
    disconnect: mockDisconnect,
};
const mockKafkaInstance = { producer: jest.fn().mockReturnValue(mockProducer) };
jest.mock('kafkajs', () => ({
    Kafka: jest.fn().mockImplementation(() => mockKafkaInstance),
}));
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
describe('KafkaProducerService', () => {
    let service;
    let configService;
    const buildModule = async (brokers) => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                kafka_producer_service_1.KafkaProducerService,
                {
                    provide: config_1.ConfigService,
                    useValue: { get: jest.fn().mockReturnValue(brokers) },
                },
            ],
        }).compile();
        service = module.get(kafka_producer_service_1.KafkaProducerService);
        configService = module.get(config_1.ConfigService);
        return module;
    };
    beforeEach(() => {
        jest.clearAllMocks();
        mockConnect.mockResolvedValue(undefined);
        mockSend.mockResolvedValue([{ partition: 0, offset: '5' }]);
        mockDisconnect.mockResolvedValue(undefined);
    });
    describe('onModuleInit', () => {
        it('connects to Kafka when KAFKA_BROKERS is set', async () => {
            await buildModule('kafka:9092');
            await service.onModuleInit();
            expect(mockConnect).toHaveBeenCalled();
        });
        it('does nothing when KAFKA_BROKERS is not set', async () => {
            await buildModule(undefined);
            await service.onModuleInit();
            expect(mockConnect).not.toHaveBeenCalled();
        });
        it('handles connection failure gracefully (logs warning, does not throw)', async () => {
            mockConnect.mockRejectedValue(new Error('Connection refused'));
            await buildModule('kafka:9092');
            await expect(service.onModuleInit()).resolves.toBeUndefined();
        });
    });
    describe('publishSensorReading', () => {
        it('publishes message to sensors.readings topic', async () => {
            await buildModule('kafka:9092');
            await service.onModuleInit();
            const reading = makeReading();
            await service.publishSensorReading(reading);
            expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ topic: kafka_producer_service_1.TOPIC_SENSOR_READINGS }));
        });
        it('uses sensorId as the partition key', async () => {
            await buildModule('kafka:9092');
            await service.onModuleInit();
            await service.publishSensorReading(makeReading({ sensorId: 'sensor-99' }));
            const call = mockSend.mock.calls[0][0];
            expect(call.messages[0].key).toBe('sensor-99');
        });
        it('serialises the message as JSON', async () => {
            await buildModule('kafka:9092');
            await service.onModuleInit();
            const reading = makeReading({ value: 3.14 });
            await service.publishSensorReading(reading);
            const call = mockSend.mock.calls[0][0];
            const parsed = JSON.parse(call.messages[0].value);
            expect(parsed.value).toBe(3.14);
        });
        it('silently skips publish when producer is not connected (KAFKA_BROKERS unset)', async () => {
            await buildModule(undefined);
            await service.onModuleInit();
            await expect(service.publishSensorReading(makeReading())).resolves.toBeUndefined();
            expect(mockSend).not.toHaveBeenCalled();
        });
        it('catches and logs send errors without rethrowing', async () => {
            mockSend.mockRejectedValue(new Error('Kafka send failed'));
            await buildModule('kafka:9092');
            await service.onModuleInit();
            await expect(service.publishSensorReading(makeReading())).resolves.toBeUndefined();
        });
        it('includes thresholdViolated=true in published payload', async () => {
            await buildModule('kafka:9092');
            await service.onModuleInit();
            await service.publishSensorReading(makeReading({ thresholdViolated: true }));
            const call = mockSend.mock.calls[0][0];
            const parsed = JSON.parse(call.messages[0].value);
            expect(parsed.thresholdViolated).toBe(true);
        });
    });
    describe('onModuleDestroy', () => {
        it('disconnects producer on module destroy', async () => {
            await buildModule('kafka:9092');
            await service.onModuleInit();
            await service.onModuleDestroy();
            expect(mockDisconnect).toHaveBeenCalled();
        });
        it('does not call disconnect when producer was never connected', async () => {
            await buildModule(undefined);
            await service.onModuleInit();
            await service.onModuleDestroy();
            expect(mockDisconnect).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=kafka.producer.service.spec.js.map