import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { StationStatus, StationType } from '../../database/entities/Station.entity';

export class CreateStationDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(255)
  location: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  capacity: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  capacityUnit?: string;

  @IsOptional()
  @IsEnum(StationType)
  type?: StationType;

  @IsOptional()
  @IsEnum(StationStatus)
  status?: StationStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipments?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
