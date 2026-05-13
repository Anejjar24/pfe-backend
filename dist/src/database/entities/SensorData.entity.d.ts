import { Sensor } from './Sensor.entity';
export declare class SensorData {
    id: string;
    value: number;
    timestamp: Date;
    qualityFlags: Record<string, any>;
    sensor: Sensor;
    createdAt: Date;
    source: string;
    accuracy: number;
}
