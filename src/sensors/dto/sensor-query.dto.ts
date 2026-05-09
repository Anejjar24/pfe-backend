import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { SensorStatus, SensorType } from '../../database/entities/Sensor.entity';

export class SensorQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsUUID()
  stationId?: string;

  @IsOptional()
  @IsEnum(SensorType)
  type?: SensorType;

  @IsOptional()
  @IsEnum(SensorStatus)
  status?: SensorStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
