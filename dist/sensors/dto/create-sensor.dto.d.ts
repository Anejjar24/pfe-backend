import { SensorStatus, SensorType } from '../../database/entities/Sensor.entity';
export declare class CreateSensorDto {
    name: string;
    type: SensorType;
    unit: string;
    stationId: string;
    location?: string;
    minThreshold?: number;
    maxThreshold?: number;
    status?: SensorStatus;
    alertEnabled?: boolean;
    deviceId?: string;
    serialNumber?: string;
    metadata?: Record<string, any>;
}
