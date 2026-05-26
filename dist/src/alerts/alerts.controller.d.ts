import { User } from '../database/entities/User.entity';
import { AlertQueryDto } from './dto/alert-query.dto';
import { CreateAlertDto } from './dto/create-alert.dto';
import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    exportCsv(status?: string, severity?: string, type?: string, stationId?: string, sensorId?: string, from?: string, to?: string): Promise<string>;
    findAll(query: AlertQueryDto): Promise<{
        data: import("../database/entities/Alert.entity").Alert[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<import("../database/entities/Alert.entity").Alert>;
    create(dto: CreateAlertDto): Promise<import("../database/entities/Alert.entity").Alert>;
    acknowledge(id: string, req: {
        user: User;
    }): Promise<import("../database/entities/Alert.entity").Alert>;
    resolve(id: string, req: {
        user: User;
    }): Promise<import("../database/entities/Alert.entity").Alert>;
}
