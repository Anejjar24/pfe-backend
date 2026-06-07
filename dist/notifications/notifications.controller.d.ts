import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(query: NotificationQueryDto): Promise<{
        data: import("../database/entities/Notification.entity").Notification[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    getUnreadCount(): Promise<{
        count: number;
    }>;
    markAllRead(): Promise<{
        updated: number;
    }>;
    markRead(id: string): Promise<import("../database/entities/Notification.entity").Notification>;
}
