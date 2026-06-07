"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const notifications_service_1 = require("./notifications.service");
const Notification_entity_1 = require("../database/entities/Notification.entity");
const User_entity_1 = require("../database/entities/User.entity");
const Alert_entity_1 = require("../database/entities/Alert.entity");
const realtime_service_1 = require("../realtime/realtime.service");
const makeNotification = (overrides = {}) => ({
    id: 'notif-uuid',
    recipient: 'all',
    status: Notification_entity_1.NotificationStatus.DELIVERED,
    readAt: null,
    createdAt: new Date(),
    ...overrides,
});
const makeAlert = () => ({
    id: 'alert-uuid',
    type: Alert_entity_1.AlertType.THRESHOLD_VIOLATION,
    severity: Alert_entity_1.AlertSeverity.ERROR,
    status: Alert_entity_1.AlertStatus.ACTIVE,
    message: 'Pressure too high',
    createdAt: new Date(),
});
const mockNotificationRepo = () => ({
    create: jest.fn((dto) => dto),
    save: jest.fn(async (entity) => ({ id: 'notif-uuid', ...entity })),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
});
const mockUserRepo = () => ({
    find: jest.fn(async () => []),
});
const mockRealtimeService = () => ({
    broadcastToAll: jest.fn(),
});
const mockConfigService = () => ({
    get: jest.fn((_key) => undefined),
});
describe('NotificationsService', () => {
    let service;
    let notifRepo;
    let realtimeService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                notifications_service_1.NotificationsService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(Notification_entity_1.Notification),
                    useFactory: mockNotificationRepo,
                },
                { provide: (0, typeorm_1.getRepositoryToken)(User_entity_1.User), useFactory: mockUserRepo },
                { provide: realtime_service_1.RealtimeService, useFactory: mockRealtimeService },
                { provide: config_1.ConfigService, useFactory: mockConfigService },
            ],
        }).compile();
        service = module.get(notifications_service_1.NotificationsService);
        notifRepo = module.get((0, typeorm_1.getRepositoryToken)(Notification_entity_1.Notification));
        realtimeService = module.get(realtime_service_1.RealtimeService);
    });
    describe('notifyAlertCreated', () => {
        it('saves a broadcast notification record', async () => {
            await service.notifyAlertCreated(makeAlert());
            expect(notifRepo.save).toHaveBeenCalledWith(expect.objectContaining({ recipient: 'all' }));
        });
        it('broadcasts notification-created via WebSocket', async () => {
            await service.notifyAlertCreated(makeAlert());
            expect(realtimeService.broadcastToAll).toHaveBeenCalledWith('notification-created', expect.objectContaining({ alertId: 'alert-uuid' }));
        });
        it('skips email when SMTP_HOST is not configured', async () => {
            await expect(service.notifyAlertCreated({
                ...makeAlert(),
                severity: Alert_entity_1.AlertSeverity.CRITICAL,
            })).resolves.toBeUndefined();
        });
    });
    describe('getUnreadCount', () => {
        it('returns a count object with a number', async () => {
            const qb = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn(async () => 3),
            };
            notifRepo.createQueryBuilder.mockReturnValue(qb);
            const result = await service.getUnreadCount();
            expect(result).toEqual({ count: 3 });
        });
    });
    describe('markRead', () => {
        it('throws NotFoundException when notification not found', async () => {
            notifRepo.findOne.mockResolvedValue(null);
            await expect(service.markRead('nonexistent')).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
        it('sets readAt and status = READ, then saves', async () => {
            const notif = makeNotification();
            notifRepo.findOne.mockResolvedValue(notif);
            notifRepo.save.mockResolvedValue({
                ...notif,
                status: Notification_entity_1.NotificationStatus.READ,
                readAt: new Date(),
            });
            const result = await service.markRead('notif-uuid');
            expect(notifRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: Notification_entity_1.NotificationStatus.READ }));
            expect(result.readAt).not.toBeNull();
        });
    });
    describe('markAllRead', () => {
        const makeUpdateQb = (affected) => ({
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            execute: jest.fn(async () => ({ affected })),
        });
        it('broadcasts notifications-read-all event', async () => {
            notifRepo.createQueryBuilder.mockReturnValue(makeUpdateQb(5));
            await service.markAllRead();
            expect(realtimeService.broadcastToAll).toHaveBeenCalledWith('notifications-read-all', { count: 0 });
        });
        it('returns count of updated rows', async () => {
            notifRepo.createQueryBuilder.mockReturnValue(makeUpdateQb(4));
            const result = await service.markAllRead();
            expect(result).toEqual({ updated: 4 });
        });
    });
});
//# sourceMappingURL=notifications.service.spec.js.map