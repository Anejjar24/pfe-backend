import { Alert } from './Alert.entity';
import { SensorData } from './SensorData.entity';
import { Station } from './Station.entity';
export declare enum SensorType {
    PRESSURE = "pressure",
    FLOW = "flow",
    TEMPERATURE = "temperature",
    QUALITY = "quality",
    LEVEL = "level",
    PH = "ph",
    TURBIDITY = "turbidity",
    CHLORINE = "chlorine"
}
export declare enum SensorStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    FAULTY = "faulty",
    OFFLINE = "offline"
}
export declare class Sensor {
    id: string;
    name: string;
    type: SensorType;
    unit: string;
    location: string;
    minThreshold: number;
    maxThreshold: number;
    lastReading: number;
    lastReadingAt: Date;
    status: SensorStatus;
    alertEnabled: boolean;
    metadata: Record<string, any>;
    station: Station;
    sensorData: SensorData[];
    alerts: Alert[];
    createdAt: Date;
    updatedAt: Date;
    deviceId: string;
    serialNumber: string;
    get isHealthy(): boolean;
    get isThresholdViolated(): boolean;
}
