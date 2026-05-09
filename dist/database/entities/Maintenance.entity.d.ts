import { User } from './User.entity';
import { Station } from './Station.entity';
export declare enum MaintenanceType {
    PREVENTIVE = "preventive",
    CORRECTIVE = "corrective",
    INSPECTION = "inspection",
    REPAIR = "repair",
    REPLACEMENT = "replacement",
    CALIBRATION = "calibration"
}
export declare enum MaintenanceStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    ON_HOLD = "on_hold"
}
export declare enum MaintenancePriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare class Maintenance {
    id: string;
    title: string;
    type: MaintenanceType;
    status: MaintenanceStatus;
    priority: MaintenancePriority;
    description: string;
    workDone: string;
    notes: string;
    station: Station;
    equipment: string;
    partNumber: string;
    estimatedCost: number;
    actualCost: number;
    estimatedDuration: number;
    actualDuration: number;
    createdBy: User;
    assignedTo: User;
    scheduledDate: Date;
    startedAt: Date;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    attachmentUrls: string[];
    metadata: Record<string, any>;
    get isOverdue(): boolean;
    get duration(): number | null;
}
