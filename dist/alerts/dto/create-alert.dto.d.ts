import { AlertSeverity, AlertType } from '../../database/entities/Alert.entity';
export declare class CreateAlertDto {
    type: AlertType;
    severity: AlertSeverity;
    message: string;
    description?: string;
    stationId?: string;
    sensorId?: string;
    sourceSystem?: string;
    data?: Record<string, any>;
}
