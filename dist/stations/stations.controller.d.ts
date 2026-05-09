import { User } from '../database/entities/User.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { StationQueryDto } from './dto/station-query.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { StationsService } from './stations.service';
export declare class StationsController {
    private readonly stationsService;
    constructor(stationsService: StationsService);
    findAll(query: StationQueryDto): Promise<{
        data: import("../database/entities/Station.entity").Station[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<import("../database/entities/Station.entity").Station>;
    create(dto: CreateStationDto, req: {
        user: User;
    }): Promise<import("../database/entities/Station.entity").Station>;
    update(id: string, dto: UpdateStationDto): Promise<import("../database/entities/Station.entity").Station>;
    remove(id: string): Promise<void>;
}
