import { Repository } from 'typeorm';
import { Sensor } from '../database/entities/Sensor.entity';
import { SensorData } from '../database/entities/SensorData.entity';
import { Station } from '../database/entities/Station.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { SensorQueryDto } from './dto/sensor-query.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
export declare class SensorsService {
    private readonly sensorRepository;
    private readonly sensorDataRepository;
    private readonly stationRepository;
    constructor(sensorRepository: Repository<Sensor>, sensorDataRepository: Repository<SensorData>, stationRepository: Repository<Station>);
    create(dto: CreateSensorDto): Promise<Sensor>;
    findAll(query: SensorQueryDto): Promise<{
        data: Sensor[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<Sensor>;
    update(id: string, dto: UpdateSensorDto): Promise<Sensor>;
    remove(id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    findData(sensorId: string, limit?: number): Promise<SensorData[]>;
}
