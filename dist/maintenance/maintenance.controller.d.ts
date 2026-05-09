import { User } from '../database/entities/User.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { MaintenanceQueryDto } from './dto/maintenance-query.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenanceService } from './maintenance.service';
export declare class MaintenanceController {
    private readonly maintenanceService;
    constructor(maintenanceService: MaintenanceService);
    findAll(query: MaintenanceQueryDto): Promise<{
        data: import("../database/entities/Maintenance.entity").Maintenance[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<import("../database/entities/Maintenance.entity").Maintenance>;
    create(dto: CreateMaintenanceDto, req: {
        user: User;
    }): Promise<import("../database/entities/Maintenance.entity").Maintenance>;
    update(id: string, dto: UpdateMaintenanceDto): Promise<import("../database/entities/Maintenance.entity").Maintenance>;
    remove(id: string): Promise<void>;
}
