import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../common/guards/jwt.guard';
import { AnalyticsService } from './analytics.service';
import { SensorStatsQueryDto, StationHistoryQueryDto } from './dto/analytics-query.dto';

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@Controller('analytics')
@UseGuards(JwtGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'System-wide KPIs: station counts, active sensors, open alerts, pending maintenance' })
  @ApiResponse({ status: 200, description: 'Overview object with counts and breakdowns' })
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('sensors/:id/stats')
  @ApiOperation({ summary: 'Per-sensor statistics: avg/min/max/stddev + hourly time-series' })
  @ApiParam({ name: 'id', description: 'Sensor UUID' })
  @ApiQuery({ name: 'from', required: false, description: 'Range start (ISO 8601). Default: 24 h ago' })
  @ApiQuery({ name: 'to', required: false, description: 'Range end (ISO 8601). Default: now' })
  @ApiResponse({ status: 200, description: 'Sensor stats + time-series buckets' })
  @ApiResponse({ status: 404, description: 'Sensor not found' })
  async getSensorStats(
    @Param('id') id: string,
    @Query() query: SensorStatsQueryDto,
  ) {
    const result = await this.analyticsService.getSensorStats(id, query);
    if (!result) throw new NotFoundException(`Sensor ${id} not found`);
    return result;
  }

  @Get('stations/:id/history')
  @ApiOperation({ summary: 'Station sensor history grouped by hour or day' })
  @ApiParam({ name: 'id', description: 'Station UUID' })
  @ApiQuery({ name: 'granularity', required: false, enum: ['hour', 'day'], description: 'Bucket size (default: hour)' })
  @ApiQuery({ name: 'from', required: false, description: 'Range start (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, description: 'Range end (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Per-sensor bucketed readings for the station' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  async getStationHistory(
    @Param('id') id: string,
    @Query() query: StationHistoryQueryDto,
  ) {
    const result = await this.analyticsService.getStationHistory(id, query);
    if (!result) throw new NotFoundException(`Station ${id} not found`);
    return result;
  }
}
