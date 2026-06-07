"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const sensors_service_1 = require("./sensors.service");
const Sensor_entity_1 = require("../database/entities/Sensor.entity");
const SensorData_entity_1 = require("../database/entities/SensorData.entity");
const Station_entity_1 = require("../database/entities/Station.entity");
const makeSensor = (overrides = {}) => ({
    id: 'sensor-uuid',
    name: 'Pressure Sensor',
    type: Sensor_entity_1.SensorType.PRESSURE,
    unit: 'bar',
    status: Sensor_entity_1.SensorStatus.ACTIVE,
    station: { id: 'station-uuid', name: 'Station Alpha' },
    lastReading: null,
    lastReadingAt: null,
    alertEnabled: false,
    minThreshold: null,
    maxThreshold: null,
    ...overrides,
});
const makeStation = () => ({ id: 'station-uuid', name: 'Station Alpha' });
const makeSensorData = () => ({
    id: 'data-uuid',
    value: 42,
    timestamp: new Date(),
    source: 'mqtt',
    qualityFlags: {},
});
const mockSensorRepo = () => ({
    create: jest.fn((dto) => ({ ...dto })),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
});
const mockSensorDataRepo = () => ({
    create: jest.fn((dto) => ({ ...dto })),
    save: jest.fn(),
    find: jest.fn(),
});
const mockStationRepo = () => ({
    findOne: jest.fn(),
});
const mockCacheManager = () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
});
describe('SensorsService', () => {
    let service;
    let sensorRepo;
    let sensorDataRepo;
    let stationRepo;
    let cacheManager;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                sensors_service_1.SensorsService,
                { provide: (0, typeorm_1.getRepositoryToken)(Sensor_entity_1.Sensor), useFactory: mockSensorRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(SensorData_entity_1.SensorData), useFactory: mockSensorDataRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(Station_entity_1.Station), useFactory: mockStationRepo },
                { provide: cache_manager_1.CACHE_MANAGER, useFactory: mockCacheManager },
            ],
        }).compile();
        service = module.get(sensors_service_1.SensorsService);
        sensorRepo = module.get((0, typeorm_1.getRepositoryToken)(Sensor_entity_1.Sensor));
        sensorDataRepo = module.get((0, typeorm_1.getRepositoryToken)(SensorData_entity_1.SensorData));
        stationRepo = module.get((0, typeorm_1.getRepositoryToken)(Station_entity_1.Station));
        cacheManager = module.get(cache_manager_1.CACHE_MANAGER);
        sensorRepo.save.mockResolvedValue(makeSensor());
        sensorRepo.findOne.mockResolvedValue(null);
        sensorRepo.findAndCount.mockResolvedValue([[], 0]);
        sensorRepo.remove.mockResolvedValue(undefined);
        sensorDataRepo.save.mockResolvedValue(makeSensorData());
        sensorDataRepo.find.mockResolvedValue([]);
        stationRepo.findOne.mockResolvedValue(null);
        cacheManager.get.mockResolvedValue(null);
        cacheManager.set.mockResolvedValue(undefined);
        cacheManager.del.mockResolvedValue(undefined);
    });
    describe('create', () => {
        const dto = {
            name: 'Pressure Sensor',
            type: Sensor_entity_1.SensorType.PRESSURE,
            unit: 'bar',
            stationId: 'station-uuid',
        };
        it('creates and returns sensor when station exists', async () => {
            const station = makeStation();
            stationRepo.findOne.mockResolvedValue(station);
            const saved = makeSensor();
            sensorRepo.save.mockResolvedValue(saved);
            const result = await service.create(dto);
            expect(sensorRepo.create).toHaveBeenCalledWith(expect.objectContaining({ station }));
            expect(sensorRepo.save).toHaveBeenCalled();
            expect(result).toEqual(saved);
        });
        it('throws NotFoundException when stationId is not found', async () => {
            stationRepo.findOne.mockResolvedValue(null);
            await expect(service.create(dto)).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
        it('clears list cache after successful creation', async () => {
            stationRepo.findOne.mockResolvedValue(makeStation());
            await service.create(dto);
            expect(cacheManager.del).not.toHaveBeenCalled();
        });
    });
    describe('findAll', () => {
        it('returns cached result when cache hit occurs', async () => {
            const cached = {
                data: [makeSensor()],
                meta: { total: 1, page: 1, limit: 20, pages: 1 },
            };
            cacheManager.get.mockResolvedValue(cached);
            const result = await service.findAll({ page: 1, limit: 20 });
            expect(result).toEqual(cached);
            expect(sensorRepo.findAndCount).not.toHaveBeenCalled();
        });
        it('queries DB and caches result on cache miss', async () => {
            cacheManager.get.mockResolvedValue(null);
            const sensors = [makeSensor()];
            sensorRepo.findAndCount.mockResolvedValue([sensors, 1]);
            const result = await service.findAll({ page: 1, limit: 20 });
            expect(sensorRepo.findAndCount).toHaveBeenCalled();
            expect(cacheManager.set).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
        });
        it('returns empty list when no sensors exist', async () => {
            cacheManager.get.mockResolvedValue(null);
            sensorRepo.findAndCount.mockResolvedValue([[], 0]);
            const result = await service.findAll({});
            expect(result.data).toHaveLength(0);
            expect(result.meta.total).toBe(0);
        });
        it('calculates page count correctly for multi-page results', async () => {
            cacheManager.get.mockResolvedValue(null);
            sensorRepo.findAndCount.mockResolvedValue([[], 50]);
            const result = await service.findAll({ page: 1, limit: 10 });
            expect(result.meta.pages).toBe(5);
        });
    });
    describe('findOne', () => {
        it('returns sensor when found', async () => {
            const sensor = makeSensor();
            sensorRepo.findOne.mockResolvedValue(sensor);
            await expect(service.findOne('sensor-uuid')).resolves.toEqual(sensor);
        });
        it('throws NotFoundException when sensor does not exist', async () => {
            sensorRepo.findOne.mockResolvedValue(null);
            await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
    describe('update', () => {
        it('updates sensor fields and clears cache', async () => {
            const existing = makeSensor();
            sensorRepo.findOne.mockResolvedValue(existing);
            const saved = makeSensor({ name: 'Renamed' });
            sensorRepo.save.mockResolvedValue(saved);
            const result = await service.update('sensor-uuid', { name: 'Renamed' });
            expect(sensorRepo.save).toHaveBeenCalled();
            expect(result).toEqual(saved);
        });
        it('re-assigns station when stationId is provided in dto', async () => {
            const existing = makeSensor();
            sensorRepo.findOne.mockResolvedValue(existing);
            const newStation = { id: 'station-2', name: 'Station Beta' };
            stationRepo.findOne.mockResolvedValue(newStation);
            sensorRepo.save.mockResolvedValue({ ...existing, station: newStation });
            await service.update('sensor-uuid', { stationId: 'station-2' });
            expect(existing.station).toEqual(newStation);
        });
        it('throws NotFoundException when new stationId does not exist', async () => {
            sensorRepo.findOne.mockResolvedValue(makeSensor());
            stationRepo.findOne.mockResolvedValue(null);
            await expect(service.update('sensor-uuid', { stationId: 'bad-station' })).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
    describe('remove', () => {
        it('removes sensor and returns { deleted: true, id }', async () => {
            const sensor = makeSensor();
            sensorRepo.findOne.mockResolvedValue(sensor);
            const result = await service.remove('sensor-uuid');
            expect(sensorRepo.remove).toHaveBeenCalledWith(sensor);
            expect(result).toEqual({ deleted: true, id: 'sensor-uuid' });
        });
        it('throws NotFoundException when sensor does not exist', async () => {
            sensorRepo.findOne.mockResolvedValue(null);
            await expect(service.remove('nonexistent')).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
    describe('injectReading', () => {
        it('updates lastReading and lastReadingAt on the sensor', async () => {
            const sensor = makeSensor();
            sensorRepo.findOne.mockResolvedValue(sensor);
            sensorRepo.save.mockResolvedValue({ ...sensor, lastReading: 99 });
            await service.injectReading('sensor-uuid', 99);
            expect(sensor.lastReading).toBe(99);
            expect(sensor.lastReadingAt).toBeInstanceOf(Date);
            expect(sensorRepo.save).toHaveBeenCalledWith(expect.objectContaining({ lastReading: 99 }));
        });
        it('creates and saves a SensorData record with source "manual"', async () => {
            const sensor = makeSensor();
            sensorRepo.findOne.mockResolvedValue(sensor);
            await service.injectReading('sensor-uuid', 55);
            expect(sensorDataRepo.create).toHaveBeenCalledWith(expect.objectContaining({ value: 55, source: 'manual' }));
            expect(sensorDataRepo.save).toHaveBeenCalled();
        });
        it('returns a structured reading summary', async () => {
            const sensor = makeSensor({ name: 'Flow Meter', unit: 'L/s' });
            sensorRepo.findOne.mockResolvedValue(sensor);
            const result = await service.injectReading('sensor-uuid', 77);
            expect(result).toMatchObject({
                sensorId: 'sensor-uuid',
                name: 'Flow Meter',
                value: 77,
                unit: 'L/s',
            });
        });
        it('throws NotFoundException when sensor does not exist', async () => {
            sensorRepo.findOne.mockResolvedValue(null);
            await expect(service.injectReading('nonexistent', 10)).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=sensors.service.spec.js.map