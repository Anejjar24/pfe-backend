import { User } from './User.entity';
import { Station } from './Station.entity';
import { Sensor } from './Sensor.entity';
import { Notification } from './Notification.entity';
export declare enum AlertType {
    THRESHOLD_VIOLATION = "threshold_violation",
    SENSOR_OFFLINE = "sensor_offline",
    MAINTENANCE_DUE = "maintenance_due",
    SYSTEM_ERROR = "system_error",
    ANOMALY = "anomaly",
    CRITICAL_EVENT = "critical_event"
}
export declare enum AlertSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
export declare enum AlertStatus {
    ACTIVE = "active",
    ACKNOWLEDGED = "acknowledged",
    RESOLVED = "resolved",
    SUPPRESSED = "suppressed"
}
export declare class Alert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    status: AlertStatus;
    message: string;
    description: string;
    data: Record<string, any>;
    station: Station;
    sensor: Sensor;
    acknowledgedAt: Date;
    acknowledgedBy: User;
    resolvedAt: Date;
    resolvedBy: User;
    sourceSystem: string;
    isNotified: boolean;
    createdAt: Date;
    updatedAt: Date;
    notifications: Notification[];
    get duration(): number;
    get isActive(): boolean;
}
