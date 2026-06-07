"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const alerts_service_1 = require("./alerts.service");
const Alert_entity_1 = require("../database/entities/Alert.entity");
const Station_entity_1 = require("../database/entities/Station.entity");
const Sensor_entity_1 = require("../database/entities/Sensor.entity");
const realtime_service_1 = require("../realtime/realtime.service");
const notifications_service_1 = require("../notifications/notifications.service");
const mockAlert = () => ({
    id: 'alert-uuid',
    type: Alert_entity_1.AlertType.THRESHOLD_VIOLATION,
    severity: Alert_entity_1.AlertSeverity.ERROR,
    status: Alert_entity_1.AlertStatus.ACTIVE,
    message: 'High pressure detected',
    createdAt: new Date(),
});
const mockStation = () => ({ id: 'station-uuid', name: 'Station Alpha' });
const mockAlertRepo = () => ({
    create: jest.fn((dto) => ({ ...dto })),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
});
const mockStationRepo = () => ({
    findOne: jest.fn(),
});
const mockSensorRepo = () => ({
    findOne: jest.fn(),
});
const mockRealtimeService = () => ({
    broadcastToAll: jest.fn(),
});
const mockNotificationsService = () => ({
    notifyAlertCreated: jest.fn(),
});
describe('AlertsService', () => {
    let service;
    let alertRepo;
    let stationRepo;
    let sensorRepo;
    let realtimeService;
    let notificationsService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                alerts_service_1.AlertsService,
                { provide: (0, typeorm_1.getRepositoryToken)(Alert_entity_1.Alert), useFactory: mockAlertRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(Station_entity_1.Station), useFactory: mockStationRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(Sensor_entity_1.Sensor), useFactory: mockSensorRepo },
                { provide: realtime_service_1.RealtimeService, useFactory: mockRealtimeService },
                { provide: notifications_service_1.NotificationsService, useFactory: mockNotificationsService },
            ],
        }).compile();
        service = module.get(alerts_service_1.AlertsService);
        alertRepo = module.get((0, typeorm_1.getRepositoryToken)(Alert_entity_1.Alert));
        stationRepo = module.get((0, typeorm_1.getRepositoryToken)(Station_entity_1.Station));
        sensorRepo = module.get((0, typeorm_1.getRepositoryToken)(Sensor_entity_1.Sensor));
        realtimeService = module.get(realtime_service_1.RealtimeService);
        notificationsService = module.get(notifications_service_1.NotificationsService);
        alertRepo.save.mockResolvedValue({ id: 'alert-uuid', type: Alert_entity_1.AlertType.THRESHOLD_VIOLATION, severity: Alert_entity_1.AlertSeverity.ERROR, message: 'test', createdAt: new Date() });
        alertRepo.findOne.mockResolvedValue(null);
        alertRepo.findAndCount.mockResolvedValue([[], 0]);
        stationRepo.findOne.mockResolvedValue(null);
        sensorRepo.findOne.mockResolvedValue(null);
        notificationsService.notifyAlertCreated.mockResolvedValue(undefined);
    });
    describe('create', () => {
        const dto = {
            type: Alert_entity_1.AlertType.THRESHOLD_VIOLATION,
            severity: Alert_entity_1.AlertSeverity.ERROR,
            message: 'High pressure detected',
        };
        it('creates and returns alert without station/sensor', async () => {
            const result = await service.create(dto);
            expect(alertRepo.save).toHaveBeenCalled();
            expect(result).toHaveProperty('id');
        });
        it('broadcasts real-time event after creation', async () => {
            await service.create(dto);
            expect(realtimeService.broadcastToAll).toHaveBeenCalledWith('alert-created', expect.objectContaining({ severity: Alert_entity_1.AlertSeverity.ERROR }));
        });
        it('fires notification without blocking (fire-and-forget)', async () => {
            await service.create(dto);
            expect(notificationsService.notifyAlertCreated).toHaveBeenCalled();
        });
        it('still creates alert even when notifyAlertCreated rejects', async () => {
            notificationsService.notifyAlertCreated.mockRejectedValue(new Error('email down'));
            await expect(service.create(dto)).resolves.toHaveProperty('id');
        });
        it('throws NotFoundException when stationId is given but station not found', async () => {
            stationRepo.findOne.mockResolvedValue(null);
            await expect(service.create({ ...dto, stationId: 'nonexistent' })).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
        it('resolves station and attaches it to alert when stationId is valid', async () => {
            const station = mockStation();
            stationRepo.findOne.mockResolvedValue(station);
            await service.create({ ...dto, stationId: station.id });
            expect(alertRepo.create).toHaveBeenCalledWith(expect.objectContaining({ station }));
        });
    });
    describe('findAll', () => {
        it('returns paginated response', async () => {
            const alerts = [mockAlert(), mockAlert()];
            alertRepo.findAndCount.mockResolvedValue([alerts, 2]);
            const result = await service.findAll({ page: 1, limit: 10 });
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
            expect(result.meta.pages).toBe(1);
        });
        it('returns empty data when no alerts exist', async () => {
            alertRepo.findAndCount.mockResolvedValue([[], 0]);
            const result = await service.findAll({});
            expect(result.data).toHaveLength(0);
            expect(result.meta.total).toBe(0);
        });
    });
    describe('findOne', () => {
        it('returns alert when found', async () => {
            const alert = mockAlert();
            alertRepo.findOne.mockResolvedValue(alert);
            await expect(service.findOne('alert-uuid')).resolves.toEqual(alert);
        });
        it('throws NotFoundException when alert does not exist', async () => {
            alertRepo.findOne.mockResolvedValue(null);
            await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=alerts.service.spec.js.map