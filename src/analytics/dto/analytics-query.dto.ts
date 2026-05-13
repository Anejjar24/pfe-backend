import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum HistoryGranularity {
  HOUR = 'hour',
  DAY = 'day',
}

export class SensorStatsQueryDto {
  @ApiPropertyOptional({ example: '2026-05-06T00:00:00Z', description: 'Range start (ISO 8601). Default: 24 h ago' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-05-13T00:00:00Z', description: 'Range end (ISO 8601). Default: now' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class StationHistoryQueryDto {
  @ApiPropertyOptional({ enum: HistoryGranularity, default: HistoryGranularity.HOUR, description: 'Bucket size for aggregation' })
  @IsOptional()
  @IsEnum(HistoryGranularity)
  granularity?: HistoryGranularity = HistoryGranularity.HOUR;

  @ApiPropertyOptional({ example: '2026-05-06T00:00:00Z', description: 'Range start (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-05-13T00:00:00Z', description: 'Range end (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
