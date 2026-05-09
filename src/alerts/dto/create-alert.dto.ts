import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { AlertSeverity, AlertType } from '../../database/entities/Alert.entity';

export class CreateAlertDto {
  @IsEnum(AlertType)
  type: AlertType;

  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  stationId?: string;

  @IsOptional()
  @IsUUID()
  sensorId?: string;

  @IsOptional()
  @IsString()
  sourceSystem?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
