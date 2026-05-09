import { Repository } from 'typeorm';
import { Maintenance } from '../database/entities/Maintenance.entity';
import { Station } from '../database/entities/Station.entity';
import { User } from '../database/entities/User.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { MaintenanceQueryDto } from './dto/maintenance-query.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
export declare class MaintenanceService {
    private readonly maintenanceRepository;
    private readonly stationRepository;
    private readonly userRepository;
    constructor(maintenanceRepository: Repository<Maintenance>, stationRepository: Repository<Station>, userRepository: Repository<User>);
    create(dto: CreateMaintenanceDto, user: User): Promise<Maintenance>;
    findAll(query: MaintenanceQueryDto): Promise<{
        data: Maintenance[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<Maintenance>;
    update(id: string, dto: UpdateMaintenanceDto): Promise<Maintenance>;
    remove(id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
}
