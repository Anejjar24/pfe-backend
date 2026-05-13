import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Alert } from '../database/entities/Alert.entity';
import { Notification } from '../database/entities/Notification.entity';
import { Sensor } from '../database/entities/Sensor.entity';
import { Station } from '../database/entities/Station.entity';
import { User } from '../database/entities/User.entity';
import { RealtimeService } from '../realtime/realtime.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
export declare class NotificationsService {
    private readonly notificationRepo;
    private readonly userRepo;
    private readonly realtimeService;
    private readonly configService;
    private readonly logger;
    constructor(notificationRepo: Repository<Notification>, userRepo: Repository<User>, realtimeService: RealtimeService, configService: ConfigService);
    notifyAlertCreated(alert: Alert, station?: Station | null, sensor?: Sensor | null): Promise<void>;
    findAll(query: NotificationQueryDto): Promise<{
        data: Notification[];
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
    markRead(id: string): Promise<Notification>;
    markAllRead(): Promise<{
        updated: number;
    }>;
    private sendEmailToAdmins;
    private buildAlertContent;
}
