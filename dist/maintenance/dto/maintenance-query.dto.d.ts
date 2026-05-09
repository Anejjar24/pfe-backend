import { MaintenancePriority, MaintenanceStatus, MaintenanceType } from '../../database/entities/Maintenance.entity';
export declare class MaintenanceQueryDto {
    page?: number;
    limit?: number;
    stationId?: string;
    status?: MaintenanceStatus;
    type?: MaintenanceType;
    priority?: MaintenancePriority;
}
