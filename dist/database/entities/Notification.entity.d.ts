import { User } from './User.entity';
import { Alert } from './Alert.entity';
export declare enum NotificationType {
    ALERT = "alert",
    MAINTENANCE = "maintenance",
    SYSTEM = "system",
    INFO = "info"
}
export declare enum NotificationChannel {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    IN_APP = "in_app"
}
export declare enum NotificationStatus {
    PENDING = "pending",
    SENT = "sent",
    DELIVERED = "delivered",
    FAILED = "failed",
    READ = "read"
}
export declare class Notification {
    id: string;
    type: NotificationType;
    channel: NotificationChannel;
    status: NotificationStatus;
    subject: string;
    content: string;
    recipient: string;
    user: User;
    alert: Alert;
    sentAt: Date;
    deliveredAt: Date;
    readAt: Date;
    failureReason: string;
    metadata: Record<string, any>;
    retryCount: number;
    nextRetryAt: Date;
    createdAt: Date;
    updatedAt: Date;
    get isRead(): boolean;
    get isFailed(): boolean;
}
