import { Repository } from 'typeorm';
import { WorkflowNode } from '../../common/types/workflow.types';
import { Notification } from '../../database/entities/Notification.entity';
import { RealtimeService } from '../../realtime/realtime.service';
export declare class NotificationHandler {
    private readonly notificationRepo;
    private readonly realtimeService;
    constructor(notificationRepo: Repository<Notification>, realtimeService: RealtimeService);
    execute(node: WorkflowNode, input: unknown): Promise<{
        notified: boolean;
        channel: string;
        notificationId: string;
    } | {
        notified: boolean;
        reason: string;
        channel?: undefined;
        status?: undefined;
        ok?: undefined;
        error?: undefined;
    } | {
        notified: boolean;
        channel: string;
        status: number;
        ok: boolean;
        reason?: undefined;
        error?: undefined;
    } | {
        notified: boolean;
        channel: string;
        error: string;
        reason?: undefined;
        status?: undefined;
        ok?: undefined;
    }>;
    private sendInApp;
    private sendWebhook;
}
