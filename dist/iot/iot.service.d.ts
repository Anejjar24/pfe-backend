import { Repository } from 'typeorm';
import { Sensor } from '../database/entities/Sensor.entity';
import { SensorData } from '../database/entities/SensorData.entity';
import { RealtimeService } from '../realtime/realtime.service';
import { AlertsService } from '../alerts/alerts.service';
export declare class IotService {
    private readonly sensorRepository;
    private readonly sensorDataRepository;
    private readonly realtimeService;
    private readonly alertsService;
    private readonly logger;
    constructor(sensorRepository: Repository<Sensor>, sensorDataRepository: Repository<SensorData>, realtimeService: RealtimeService, alertsService: AlertsService);
    processSensorData(sensorId: string, value: number): Promise<void>;
    getSensorData(sensorId: string, limit?: number): Promise<SensorData[]>;
    getSensorStatus(sensorId: string): Promise<Sensor | null>;
    getActiveStationSensors(stationId: string): Promise<Sensor[]>;
}
