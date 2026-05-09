import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { SensorStatus, SensorType } from '../../database/entities/Sensor.entity';

export class CreateSensorDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsEnum(SensorType)
  type: SensorType;

  @IsString()
  @MaxLength(50)
  unit: string;

  @IsUUID()
  stationId: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  minThreshold?: number;

  @IsOptional()
  @IsNumber()
  maxThreshold?: number;

  @IsOptional()
  @IsEnum(SensorStatus)
  status?: SensorStatus;

  @IsOptional()
  @IsBoolean()
  alertEnabled?: boolean;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
