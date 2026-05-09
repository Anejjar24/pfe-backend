import { Repository } from 'typeorm';
import { Alert } from '../database/entities/Alert.entity';
import { Sensor } from '../database/entities/Sensor.entity';
import { Station } from '../database/entities/Station.entity';
import { User } from '../database/entities/User.entity';
import { RealtimeService } from '../realtime/realtime.service';
import { AlertQueryDto } from './dto/alert-query.dto';
import { CreateAlertDto } from './dto/create-alert.dto';
export declare class AlertsService {
    private readonly alertRepository;
    private readonly stationRepository;
    private readonly sensorRepository;
    private readonly realtimeService;
    constructor(alertRepository: Repository<Alert>, stationRepository: Repository<Station>, sensorRepository: Repository<Sensor>, realtimeService: RealtimeService);
    create(dto: CreateAlertDto): Promise<Alert>;
    findAll(query: AlertQueryDto): Promise<{
        data: Alert[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<Alert>;
    acknowledge(id: string, user: User): Promise<Alert>;
    resolve(id: string, user: User): Promise<Alert>;
}
