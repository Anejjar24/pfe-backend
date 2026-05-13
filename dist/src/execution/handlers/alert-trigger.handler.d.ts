import { AlertSeverity } from '../../database/entities/Alert.entity';
import { AlertsService } from '../../alerts/alerts.service';
import { WorkflowNode } from '../../common/types/workflow.types';
export declare class AlertTriggerHandler {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    execute(node: WorkflowNode, input: unknown): Promise<{
        alertId: string;
        severity: AlertSeverity;
        message: string;
        status: import("../../database/entities/Alert.entity").AlertStatus;
    }>;
}
