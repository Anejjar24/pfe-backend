import { MaintenancePriority, MaintenanceStatus, MaintenanceType } from '../../database/entities/Maintenance.entity';
export declare class CreateMaintenanceDto {
    title: string;
    type: MaintenanceType;
    status?: MaintenanceStatus;
    priority?: MaintenancePriority;
    description: string;
    stationId: string;
    assignedToId?: string;
    equipment?: string;
    partNumber?: string;
    estimatedCost?: number;
    estimatedDuration?: number;
    scheduledDate?: string;
    notes?: string;
    metadata?: Record<string, any>;
}
