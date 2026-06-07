import { CreateMaintenanceDto } from './create-maintenance.dto';
declare const UpdateMaintenanceDto_base: import("@nestjs/common").Type<Partial<CreateMaintenanceDto>>;
export declare class UpdateMaintenanceDto extends UpdateMaintenanceDto_base {
    workDone?: string;
    actualCost?: number;
    actualDuration?: number;
    startedAt?: string;
    completedAt?: string;
    assignedToId?: string;
}
export {};
