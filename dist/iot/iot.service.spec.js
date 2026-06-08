"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const iot_service_1 = require("./iot.service");
const Sensor_entity_1 = require("../database/entities/Sensor.entity");
const SensorData_entity_1 = require("../database/entities/SensorData.entity");
const realtime_service_1 = require("../realtime/realtime.service");
const alerts_service_1 = require("../alerts/alerts.service");
const Alert_entity_1 = require("../database/entities/Alert.entity");
const kafka_producer_service_1 = require("./kafka/kafka.producer.service");
const makeSensor = (overrides = {}) => {
    const sensor = {
        id: 'sensor-uuid',
        name: 'Pressure Sensor',
        type: Sensor_entity_1.SensorType.PRESSURE,
        unit: 'bar',
        status: Sensor_entity_1.SensorStatus.INACTIVE,
        lastReading: null,
        lastReadingAt: null,
        alertEnabled: false,
        minThreshold: null,
        maxThreshold: null,
        station: { id: 'station-uuid', name: 'Station Alpha' },
        ...overrides,
    };
    Object.defineProperty(sensor, 'isThresholdViolated', {
        get() {
            if (!this.lastReading)
                return false;
            if (this.minThreshold && this.lastReading < this.minThreshold)
                return true;
            if (this.maxThreshold && this.lastReading > this.maxThreshold)
                return true;
            return false;
        },
        configurable: true,
    });
    return sensor;
};
const makeSensorData = () => ({
    id: 'data-uuid',
    value: 42,
    timestamp: new Date(),
    qualityFlags: {},
});
const mockSensorRepo = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
});
const mockSensorDataRepo = () => ({
    create: jest.fn((dto) => ({ ...dto })),
    save: jest.fn(),
    find: jest.fn(),
});
const mockRealtimeService = () => ({
    broadcastToAll: jest.fn(),
});
const mockAlertsService = () => ({
    create: jest.fn(),
});
const mockKafkaProducerService = () => ({
    publishSensorReading: jest.fn().mockResolvedValue(undefined),
});
describe('IotService', () => {
    let service;
    let sensorRepo;
    let sensorDataRepo;
    let realtimeService;
    let alertsService;
    let kafkaProducer;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                iot_service_1.IotService,
                { provide: (0, typeorm_1.getRepositoryToken)(Sensor_entity_1.Sensor), useFactory: mockSensorRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(SensorData_entity_1.SensorData), useFactory: mockSensorDataRepo },
                { provide: realtime_service_1.RealtimeService, useFactory: mockRealtimeService },
                { provide: alerts_service_1.AlertsService, useFactory: mockAlertsService },
                { provide: kafka_producer_service_1.KafkaProducerService, useFactory: mockKafkaProducerService },
            ],
        }).compile();
        service = module.get(iot_service_1.IotService);
        sensorRepo = module.get((0, typeorm_1.getRepositoryToken)(Sensor_entity_1.Sensor));
        sensorDataRepo = module.get((0, typeorm_1.getRepositoryToken)(SensorData_entity_1.SensorData));
        realtimeService = module.get(realtime_service_1.RealtimeService);
        alertsService = module.get(alerts_service_1.AlertsService);
        kafkaProducer = module.get(kafka_producer_service_1.KafkaProducerService);
        sensorRepo.findOne.mockResolvedValue(null);
        sensorRepo.save.mockResolvedValue(makeSensor());
        sensorRepo.find.mockResolvedValue([]);
        sensorDataRepo.save.mockResolvedValue(makeSensorData());
        sensorDataRepo.find.mockResolvedValue([]);
        alertsService.create.mockResolvedValue({});
    });
    describe('processSensorData', () => {
        it('updates sensor lastReading, lastReadingAt and status to ACTIVE', async () => {
            const sensor = makeSensor({ status: Sensor_entity_1.SensorStatus.INACTIVE });
            sensorRepo.findOne.mockResolvedValue(sensor);
            await service.processSensorData('sensor-uuid', 42);
            expect(sensor.lastReading).toBe(42);
            expect(sensor.lastReadingAt).toBeInstanceOf(Date);
            expect(sensor.status).toBe(Sensor_entity_1.SensorStatus.ACTIVE);
            expect(sensorRepo.save).toHaveBeenCalledWith(expect.objectContaining({ lastReading: 42, status: Sensor_entity_1.SensorStatus.ACTIVE }));
        });
        it('creates and saves a SensorData record for each reading', async () => {
            sensorRepo.findOne.mockResolvedValue(makeSensor());
            await service.processSensorData('sensor-uuid', 55);
            expect(sensorDataRepo.create).toHaveBeenCalledWith(expect.objectContaining({ value: 55 }));
            expect(sensorDataRepo.save).toHaveBeenCalled();
        });
        it('broadcasts sensor-update event via RealtimeService', async () => {
            const sensor = makeSensor();
            sensorRepo.findOne.mockResolvedValue(sensor);
            await service.processSensorData('sensor-uuid', 30);
            expect(realtimeService.broadcastToAll).toHaveBeenCalledWith('sensor-update', expect.objectContaining({
                sensorId: 'sensor-uuid',
                value: 30,
            }));
        });
        it('publishes a sensor reading event to Kafka after saving', async () => {
            const sensor = makeSensor({ type: Sensor_entity_1.SensorType.PRESSURE, unit: 'bar' });
            sensorRepo.findOne.mockResolvedValue(sensor);
            await service.processSensorData('sensor-uuid', 42);
            expect(kafkaProducer.publishSensorReading).toHaveBeenCalledWith(expect.objectContaining({
                sensorId: 'sensor-uuid',
                value: 42,
                type: Sensor_entity_1.SensorType.PRESSURE,
                unit: 'bar',
            }));
        });
        it('does NOT create alert when threshold is not violated', async () => {
            const sensor = makeSensor({
                lastReading: 50,
                minThreshold: 10,
                maxThreshold: 100,
                alertEnabled: true,
            });
            sensorRepo.findOne.mockResolvedValue(sensor);
            await service.processSensorData('sensor-uuid', 50);
            expect(alertsService.create).not.toHaveBeenCalled();
        });
        it('creates threshold alert when maxThreshold is exceeded and alertEnabled is true', async () => {
            const sensor = makeSensor({
                lastReading: 150,
                minThreshold: 10,
                maxThreshold: 100,
                alertEnabled: true,
            });
            sensorRepo.findOne.mockResolvedValue(sensor);
            await service.processSensorData('sensor-uuid', 150);
            expect(alertsService.create).toHaveBeenCalledWith(expect.objectContaining({
                type: Alert_entity_1.AlertType.THRESHOLD_VIOLATION,
                severity: Alert_entity_1.AlertSeverity.WARNING,
                sensorId: 'sensor-uuid',
                sourceSystem: 'iot-mqtt',
            }));
        });
        it('creates threshold alert when value is below minThreshold and alertEnabled is true', async () => {
            const sensor = makeSensor({
                lastReading: 2,
                minThreshold: 10,
                maxThreshold: 100,
                alertEnabled: true,
            });
            sensorRepo.findOne.mockResolvedValue(sensor);
            await service.processSensorData('sensor-uuid', 2);
            expect(alertsService.create).toHaveBeenCalledWith(expect.objectContaining({ type: Alert_entity_1.AlertType.THRESHOLD_VIOLATION }));
        });
        it('does NOT create alert even when threshold is violated if alertEnabled is false', async () => {
            const sensor = makeSensor({
                lastReading: 999,
                maxThreshold: 100,
                alertEnabled: false,
            });
            sensorRepo.findOne.mockResolvedValue(sensor);
            await service.processSensorData('sensor-uuid', 999);
            expect(alertsService.create).not.toHaveBeenCalled();
        });
        it('returns early and does not throw when sensor is not found', async () => {
            sensorRepo.findOne.mockResolvedValue(null);
            await expect(service.processSensorData('nonexistent', 42)).resolves.toBeUndefined();
            expect(sensorRepo.save).not.toHaveBeenCalled();
            expect(realtimeService.broadcastToAll).not.toHaveBeenCalled();
        });
        it('does not propagate error when alertsService.create rejects', async () => {
            const sensor = makeSensor({
                lastReading: 999,
                maxThreshold: 100,
                alertEnabled: true,
            });
            sensorRepo.findOne.mockResolvedValue(sensor);
            alertsService.create.mockRejectedValue(new Error('DB error'));
            await expect(service.processSensorData('sensor-uuid', 999)).resolves.toBeUndefined();
        });
    });
    describe('getSensorStatus', () => {
        it('returns sensor when found', async () => {
            const sensor = makeSensor();
            sensorRepo.findOne.mockResolvedValue(sensor);
            const result = await service.getSensorStatus('sensor-uuid');
            expect(result).toEqual(sensor);
            expect(sensorRepo.findOne).toHaveBeenCalledWith({
                where: { id: 'sensor-uuid' },
            });
        });
        it('returns null when sensor is not found', async () => {
            sensorRepo.findOne.mockResolvedValue(null);
            const result = await service.getSensorStatus('nonexistent');
            expect(result).toBeNull();
        });
    });
    describe('getActiveStationSensors', () => {
        it('returns only ACTIVE sensors for the given station', async () => {
            const activeSensors = [
                makeSensor({ id: 's1', status: Sensor_entity_1.SensorStatus.ACTIVE }),
                makeSensor({ id: 's2', status: Sensor_entity_1.SensorStatus.ACTIVE }),
            ];
            sensorRepo.find.mockResolvedValue(activeSensors);
            const result = await service.getActiveStationSensors('station-uuid');
            expect(result).toEqual(activeSensors);
            expect(sensorRepo.find).toHaveBeenCalledWith({
                where: {
                    station: { id: 'station-uuid' },
                    status: Sensor_entity_1.SensorStatus.ACTIVE,
                },
            });
        });
        it('returns empty array when station has no active sensors', async () => {
            sensorRepo.find.mockResolvedValue([]);
            const result = await service.getActiveStationSensors('station-uuid');
            expect(result).toEqual([]);
        });
    });
});
//# sourceMappingURL=iot.service.spec.js.map