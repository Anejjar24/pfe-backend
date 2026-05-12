import { Repository } from 'typeorm';
import { Station } from '../database/entities/Station.entity';
import { User } from '../database/entities/User.entity';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateStationDto } from './dto/create-station.dto';
import { StationQueryDto } from './dto/station-query.dto';
import { UpdateStationDto } from './dto/update-station.dto';
export declare class StationsService {
    private readonly stationRepository;
    private readonly realtimeService;
    constructor(stationRepository: Repository<Station>, realtimeService: RealtimeService);
    create(dto: CreateStationDto, user: User): Promise<Station>;
    findAll(query: StationQueryDto): Promise<{
        data: Station[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<Station>;
    update(id: string, dto: UpdateStationDto): Promise<Station>;
    remove(id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
}
