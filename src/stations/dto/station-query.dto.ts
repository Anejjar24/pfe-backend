import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { StationStatus, StationType } from '../../database/entities/Station.entity';

export class StationQueryDto {
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
  @IsEnum(StationStatus)
  status?: StationStatus;

  @IsOptional()
  @IsEnum(StationType)
  type?: StationType;

  @IsOptional()
  @IsString()
  search?: string;
}
