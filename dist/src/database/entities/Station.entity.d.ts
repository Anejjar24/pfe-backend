import { Alert } from './Alert.entity';
import { Maintenance } from './Maintenance.entity';
import { Sensor } from './Sensor.entity';
import { User } from './User.entity';
export declare enum StationStatus {
    NORMAL = "normal",
    WARNING = "warning",
    CRITICAL = "critical",
    OFFLINE = "offline"
}
export declare enum StationType {
    TREATMENT = "treatment",
    DISTRIBUTION = "distribution",
    STORAGE = "storage",
    MONITORING = "monitoring"
}
export declare class Station {
    id: string;
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    capacity: number;
    capacityUnit: string;
    type: StationType;
    status: StationStatus;
    description: string;
    equipments: string[];
    metadata: Record<string, any>;
    createdBy: User;
    sensors: Sensor[];
    alerts: Alert[];
    maintenances: Maintenance[];
    createdAt: Date;
    updatedAt: Date;
    lastStatusChange: Date;
    get statusColor(): string;
}
