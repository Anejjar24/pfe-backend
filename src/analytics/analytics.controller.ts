import { Controller, Get, NotFoundException, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../common/guards/jwt.guard';
import { KafkaConsumerService } from '../iot/kafka/kafka.consumer.service';
import { AnalyticsService } from './analytics.service';
import { SensorStatsQueryDto, StationHistoryQueryDto } from './dto/analytics-query.dto';

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@Controller('analytics')
@UseGuards(JwtGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly kafkaConsumer: KafkaConsumerService,
  ) {}

  @Get('pipeline/stats')
  @ApiOperation({ summary: 'Kafka pipeline health: messages consumed, last event timestamps, consumer group' })
  @ApiResponse({ status: 200, description: 'Pipeline stats object' })
  getPipelineStats() {
    return {
      ...this.kafkaConsumer.getPipelineStats(),
      consumerRunning: this.kafkaConsumer.getIsRunning(),
    };
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Pre-computed sensor KPIs from Spark aggregation (sensor_aggregates table)' })
  @ApiQuery({ name: 'granularity', required: false, enum: ['hourly', 'daily'], description: 'Bucket size (default: hourly)' })
  @ApiQuery({ name: 'hours', required: false, description: 'Look-back window in hours (default: 24)' })
  @ApiResponse({ status: 200, description: 'KPI rows + anomaly summary per station' })
  async getKpis(
    @Query('granularity') granularity?: 'hourly' | 'daily',
    @Query('hours', new ParseIntPipe({ optional: true })) hours?: number,
  ) {
    return this.analyticsService.getKpis(granularity ?? 'hourly', hours ?? 24);
  }

  @Get('system-metrics')
  @ApiOperation({ summary: 'System throughput from TimescaleDB continuous aggregates (top sensors by reading count)' })
  @ApiQuery({ name: 'hours', required: false, description: 'Look-back window in hours (default: 24)' })
  @ApiResponse({ status: 200, description: 'System-level throughput metrics' })
  async getSystemMetrics(@Query('hours', new ParseIntPipe({ optional: true })) hours?: number) {
    return this.analyticsService.getSystemMetrics(hours ?? 24);
  }

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
