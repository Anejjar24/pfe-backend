import { IsDateString, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import {
  MaintenancePriority,
  MaintenanceStatus,
  MaintenanceType,
} from '../../database/entities/Maintenance.entity';

export class CreateMaintenanceDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @IsString()
  description: string;

  @IsUUID()
  stationId: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  equipment?: string;

  @IsOptional()
  @IsString()
  partNumber?: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
