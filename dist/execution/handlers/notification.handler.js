"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationHandler = void 0;
const Notification_entity_1 = require("../../database/entities/Notification.entity");
class NotificationHandler {
    constructor(notificationRepo, realtimeService) {
        this.notificationRepo = notificationRepo;
        this.realtimeService = realtimeService;
    }
    async execute(node, input) {
        const channel = String(node.data?.channel || 'in_app');
        const subject = String(node.data?.subject || 'Workflow Notification');
        const contentTemplate = String(node.data?.message || node.data?.content || '');
        const content = contentTemplate || JSON.stringify(input);
        if (channel === 'in_app' || channel === 'email' || channel === 'sms' || channel === 'slack') {
            return this.sendInApp(subject, content);
        }
        if (channel === 'webhook') {
            return this.sendWebhook(node, subject, content, input);
        }
        return { notified: false, reason: `unsupported channel: ${channel}` };
    }
    async sendInApp(subject, content) {
        const notification = await this.notificationRepo.save(this.notificationRepo.create({
            type: Notification_entity_1.NotificationType.SYSTEM,
            channel: Notification_entity_1.NotificationChannel.IN_APP,
            status: Notification_entity_1.NotificationStatus.DELIVERED,
            subject,
            content,
            recipient: 'all',
            sentAt: new Date(),
            deliveredAt: new Date(),
        }));
        this.realtimeService.broadcastToAll('notification-created', {
            id: notification.id,
            type: notification.type,
            subject: notification.subject,
            content: notification.content,
            createdAt: notification.createdAt,
        });
        return { notified: true, channel: 'in_app', notificationId: notification.id };
    }
    async sendWebhook(node, subject, content, input) {
        const url = String(node.data?.webhookUrl || '').trim();
        if (!url) {
            return { notified: false, reason: 'webhookUrl not configured' };
        }
        const body = { subject, content, data: input, timestamp: new Date().toISOString() };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            return {
                notified: response.ok,
                channel: 'webhook',
                status: response.status,
                ok: response.ok,
            };
        }
        catch (err) {
            return {
                notified: false,
                channel: 'webhook',
                error: err instanceof Error ? err.message : String(err),
            };
        }
    }
}
exports.NotificationHandler = NotificationHandler;
//# sourceMappingURL=notification.handler.js.map