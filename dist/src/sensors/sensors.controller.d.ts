import { CreateSensorDto } from './dto/create-sensor.dto';
import { SensorQueryDto } from './dto/sensor-query.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { SensorsService } from './sensors.service';
export declare class SensorsController {
    private readonly sensorsService;
    constructor(sensorsService: SensorsService);
    findAll(query: SensorQueryDto): Promise<{
        data: import("../database/entities/Sensor.entity").Sensor[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<import("../database/entities/Sensor.entity").Sensor>;
    findData(id: string, limit?: number): Promise<import("../database/entities/SensorData.entity").SensorData[]>;
    create(dto: CreateSensorDto): Promise<import("../database/entities/Sensor.entity").Sensor>;
    update(id: string, dto: UpdateSensorDto): Promise<import("../database/entities/Sensor.entity").Sensor>;
    remove(id: string): Promise<void>;
    injectReading(id: string, value: number): Promise<{
        sensorId: string;
        name: string;
        value: number;
        unit: string;
        timestamp: Date;
        status: import("../database/entities/Sensor.entity").SensorStatus;
        station: {
            id: string;
            name: string;
        } | null;
    }>;
}
