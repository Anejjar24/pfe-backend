import { AlertSeverity, AlertStatus, AlertType } from '../../database/entities/Alert.entity';
export declare class AlertQueryDto {
    page?: number;
    limit?: number;
    status?: AlertStatus;
    severity?: AlertSeverity;
    type?: AlertType;
    stationId?: string;
    sensorId?: string;
}
