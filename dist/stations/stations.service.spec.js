"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const stations_service_1 = require("./stations.service");
const Station_entity_1 = require("../database/entities/Station.entity");
const realtime_service_1 = require("../realtime/realtime.service");
const makeStation = (overrides = {}) => ({
    id: 'station-uuid',
    name: 'Station Alpha',
    status: Station_entity_1.StationStatus.NORMAL,
    type: Station_entity_1.StationType.DISTRIBUTION,
    lastStatusChange: null,
    createdBy: null,
    ...overrides,
});
const makeUser = () => ({ id: 'user-uuid', name: 'Admin' });
const mockStationRepo = () => ({
    create: jest.fn((dto) => ({ ...dto })),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
});
const mockRealtimeService = () => ({
    broadcastToAll: jest.fn(),
});
describe('StationsService', () => {
    let service;
    let stationRepo;
    let realtimeService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                stations_service_1.StationsService,
                { provide: (0, typeorm_1.getRepositoryToken)(Station_entity_1.Station), useFactory: mockStationRepo },
                { provide: realtime_service_1.RealtimeService, useFactory: mockRealtimeService },
            ],
        }).compile();
        service = module.get(stations_service_1.StationsService);
        stationRepo = module.get((0, typeorm_1.getRepositoryToken)(Station_entity_1.Station));
        realtimeService = module.get(realtime_service_1.RealtimeService);
        stationRepo.save.mockResolvedValue(makeStation());
        stationRepo.findOne.mockResolvedValue(null);
        stationRepo.findAndCount.mockResolvedValue([[], 0]);
        stationRepo.remove.mockResolvedValue(undefined);
    });
    describe('create', () => {
        const dto = { name: 'New Station', type: 'pumping', status: 'active' };
        it('creates and saves a station, then returns it', async () => {
            const saved = makeStation({ name: 'New Station' });
            stationRepo.save.mockResolvedValue(saved);
            const result = await service.create(dto, makeUser());
            expect(stationRepo.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Station' }));
            expect(stationRepo.save).toHaveBeenCalled();
            expect(result).toEqual(saved);
        });
        it('sets lastStatusChange when status is provided', async () => {
            await service.create({ name: 'S', type: 'pumping', status: 'active' }, makeUser());
            expect(stationRepo.create).toHaveBeenCalledWith(expect.objectContaining({ lastStatusChange: expect.any(Date) }));
        });
        it('does NOT set lastStatusChange when status is absent', async () => {
            await service.create({ name: 'S', type: 'pumping' }, makeUser());
            const callArg = stationRepo.create.mock.calls[0][0];
            expect(callArg).not.toHaveProperty('lastStatusChange');
        });
    });
    describe('findAll', () => {
        it('returns paginated response with correct meta', async () => {
            const stations = [makeStation(), makeStation({ id: 'station-2' })];
            stationRepo.findAndCount.mockResolvedValue([stations, 2]);
            const result = await service.findAll({ page: 1, limit: 10 });
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
            expect(result.meta.page).toBe(1);
            expect(result.meta.limit).toBe(10);
            expect(result.meta.pages).toBe(1);
        });
        it('returns empty data when no stations exist', async () => {
            stationRepo.findAndCount.mockResolvedValue([[], 0]);
            const result = await service.findAll({});
            expect(result.data).toHaveLength(0);
            expect(result.meta.total).toBe(0);
        });
        it('uses default page=1 and limit=20 when not provided', async () => {
            stationRepo.findAndCount.mockResolvedValue([[], 0]);
            await service.findAll({});
            expect(stationRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 20 }));
        });
    });
    describe('findOne', () => {
        it('returns station when found', async () => {
            const station = makeStation();
            stationRepo.findOne.mockResolvedValue(station);
            await expect(service.findOne('station-uuid')).resolves.toEqual(station);
        });
        it('throws NotFoundException when station does not exist', async () => {
            stationRepo.findOne.mockResolvedValue(null);
            await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
    describe('update', () => {
        it('saves and returns updated station', async () => {
            const existing = makeStation({ status: Station_entity_1.StationStatus.NORMAL });
            const updated = makeStation({ status: Station_entity_1.StationStatus.OFFLINE });
            stationRepo.findOne.mockResolvedValue(existing);
            stationRepo.save.mockResolvedValue(updated);
            const result = await service.update('station-uuid', { status: Station_entity_1.StationStatus.OFFLINE });
            expect(stationRepo.save).toHaveBeenCalled();
            expect(result).toEqual(updated);
        });
        it('sets lastStatusChange when status actually changes', async () => {
            const existing = makeStation({ status: Station_entity_1.StationStatus.NORMAL });
            stationRepo.findOne.mockResolvedValue(existing);
            stationRepo.save.mockResolvedValue({ ...existing, status: Station_entity_1.StationStatus.OFFLINE });
            await service.update('station-uuid', { status: Station_entity_1.StationStatus.OFFLINE });
            expect(existing.lastStatusChange).toBeInstanceOf(Date);
        });
        it('does NOT update lastStatusChange when status stays the same', async () => {
            const existing = makeStation({ status: Station_entity_1.StationStatus.NORMAL, lastStatusChange: null });
            stationRepo.findOne.mockResolvedValue(existing);
            stationRepo.save.mockResolvedValue(existing);
            await service.update('station-uuid', { status: Station_entity_1.StationStatus.NORMAL });
            expect(existing.lastStatusChange).toBeNull();
        });
        it('broadcasts station-status event when dto contains a status field', async () => {
            const saved = makeStation({ status: Station_entity_1.StationStatus.OFFLINE });
            stationRepo.findOne.mockResolvedValue(makeStation({ status: Station_entity_1.StationStatus.NORMAL }));
            stationRepo.save.mockResolvedValue(saved);
            await service.update('station-uuid', { status: Station_entity_1.StationStatus.OFFLINE });
            expect(realtimeService.broadcastToAll).toHaveBeenCalledWith('station-status', expect.objectContaining({ stationId: saved.id, status: Station_entity_1.StationStatus.OFFLINE }));
        });
        it('does NOT broadcast when dto has no status field', async () => {
            const existing = makeStation();
            stationRepo.findOne.mockResolvedValue(existing);
            stationRepo.save.mockResolvedValue(existing);
            await service.update('station-uuid', { name: 'Renamed' });
            expect(realtimeService.broadcastToAll).not.toHaveBeenCalled();
        });
        it('throws NotFoundException when station is not found', async () => {
            stationRepo.findOne.mockResolvedValue(null);
            await expect(service.update('nonexistent', { name: 'X' })).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
    describe('remove', () => {
        it('removes station and returns { deleted: true, id }', async () => {
            const station = makeStation();
            stationRepo.findOne.mockResolvedValue(station);
            const result = await service.remove('station-uuid');
            expect(stationRepo.remove).toHaveBeenCalledWith(station);
            expect(result).toEqual({ deleted: true, id: 'station-uuid' });
        });
        it('throws NotFoundException when station does not exist', async () => {
            stationRepo.findOne.mockResolvedValue(null);
            await expect(service.remove('nonexistent')).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=stations.service.spec.js.map