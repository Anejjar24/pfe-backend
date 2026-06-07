"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const Alert_entity_1 = require("../database/entities/Alert.entity");
const Notification_entity_1 = require("../database/entities/Notification.entity");
const User_entity_1 = require("../database/entities/User.entity");
const realtime_service_1 = require("../realtime/realtime.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(notificationRepo, userRepo, realtimeService, configService) {
        this.notificationRepo = notificationRepo;
        this.userRepo = userRepo;
        this.realtimeService = realtimeService;
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async notifyAlertCreated(alert, station, sensor) {
        const subject = `[AquaFlow] ${alert.severity.toUpperCase()} Alert: ${alert.message}`;
        const content = this.buildAlertContent(alert, station, sensor);
        const notification = await this.notificationRepo.save(this.notificationRepo.create({
            type: Notification_entity_1.NotificationType.ALERT,
            channel: Notification_entity_1.NotificationChannel.IN_APP,
            status: Notification_entity_1.NotificationStatus.DELIVERED,
            subject,
            content,
            recipient: 'all',
            alert,
            sentAt: new Date(),
            deliveredAt: new Date(),
        }));
        this.realtimeService.broadcastToAll('notification-created', {
            id: notification.id,
            type: notification.type,
            subject: notification.subject,
            content: notification.content,
            severity: alert.severity,
            alertId: alert.id,
            stationId: station?.id ?? null,
            sensorId: sensor?.id ?? null,
            createdAt: notification.createdAt,
        });
        if (alert.severity === Alert_entity_1.AlertSeverity.CRITICAL) {
            await this.sendEmailToAdmins(subject, content, alert).catch((err) => this.logger.warn(`Email delivery failed: ${err.message}`));
        }
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const qb = this.notificationRepo
            .createQueryBuilder('n')
            .leftJoinAndSelect('n.alert', 'alert')
            .where('n.recipient = :all', { all: 'all' })
            .orderBy('n.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        if (query.unreadOnly) {
            qb.andWhere('n.readAt IS NULL');
        }
        const [data, total] = await qb.getManyAndCount();
        return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
    }
    async getUnreadCount() {
        const count = await this.notificationRepo
            .createQueryBuilder('n')
            .where('n.recipient = :all', { all: 'all' })
            .andWhere('n.readAt IS NULL')
            .getCount();
        return { count };
    }
    async markRead(id) {
        const notification = await this.notificationRepo.findOne({ where: { id } });
        if (!notification)
            throw new common_1.NotFoundException(`Notification ${id} not found`);
        notification.status = Notification_entity_1.NotificationStatus.READ;
        notification.readAt = new Date();
        return this.notificationRepo.save(notification);
    }
    async markAllRead() {
        const result = await this.notificationRepo
            .createQueryBuilder()
            .update(Notification_entity_1.Notification)
            .set({ status: Notification_entity_1.NotificationStatus.READ, readAt: new Date() })
            .where('recipient = :all', { all: 'all' })
            .andWhere('readAt IS NULL')
            .execute();
        this.realtimeService.broadcastToAll('notifications-read-all', { count: 0 });
        return { updated: result.affected ?? 0 };
    }
    async sendEmailToAdmins(subject, content, alert) {
        const smtpHost = this.configService.get('SMTP_HOST');
        if (!smtpHost) {
            this.logger.debug('SMTP not configured — skipping email notification');
            return;
        }
        const admins = await this.userRepo.find({
            where: { role: User_entity_1.UserRole.ADMIN, isActive: true },
        });
        if (!admins.length)
            return;
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: this.configService.get('SMTP_PORT') ?? 587,
            secure: false,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
        const from = this.configService.get('SMTP_FROM') || 'noreply@aquaflow.io';
        for (const admin of admins) {
            try {
                await transporter.sendMail({
                    from,
                    to: admin.email,
                    subject,
                    html: `<p>${content.replace(/\n/g, '<br>')}</p>`,
                });
                await this.notificationRepo.save(this.notificationRepo.create({
                    type: Notification_entity_1.NotificationType.ALERT,
                    channel: Notification_entity_1.NotificationChannel.EMAIL,
                    status: Notification_entity_1.NotificationStatus.SENT,
                    subject,
                    content,
                    recipient: admin.email,
                    user: admin,
                    alert,
                    sentAt: new Date(),
                }));
                this.logger.log(`Alert email sent to ${admin.email}`);
            }
            catch (err) {
                this.logger.warn(`Failed to send email to ${admin.email}: ${err.message}`);
                await this.notificationRepo.save(this.notificationRepo.create({
                    type: Notification_entity_1.NotificationType.ALERT,
                    channel: Notification_entity_1.NotificationChannel.EMAIL,
                    status: Notification_entity_1.NotificationStatus.FAILED,
                    subject,
                    content,
                    recipient: admin.email,
                    user: admin,
                    alert,
                    failureReason: err.message,
                }));
            }
        }
    }
    buildAlertContent(alert, station, sensor) {
        const lines = [
            `Severity: ${alert.severity.toUpperCase()}`,
            `Type: ${alert.type}`,
            `Message: ${alert.message}`,
        ];
        if (alert.description)
            lines.push(`Details: ${alert.description}`);
        if (station)
            lines.push(`Station: ${station.name}`);
        if (sensor)
            lines.push(`Sensor: ${sensor.name} (${sensor.unit})`);
        lines.push(`Time: ${new Date().toISOString()}`);
        return lines.join('\n');
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(User_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        realtime_service_1.RealtimeService,
        config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map