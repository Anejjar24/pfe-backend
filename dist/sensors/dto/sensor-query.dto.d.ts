import { SensorStatus, SensorType } from '../../database/entities/Sensor.entity';
export declare class SensorQueryDto {
    page?: number;
    limit?: number;
    stationId?: string;
    type?: SensorType;
    status?: SensorStatus;
    search?: string;
}
