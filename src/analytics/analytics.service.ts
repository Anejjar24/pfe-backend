import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert, AlertStatus } from '../database/entities/Alert.entity';
import { Maintenance, MaintenanceStatus } from '../database/entities/Maintenance.entity';
import { Sensor, SensorStatus } from '../database/entities/Sensor.entity';
import { SensorData } from '../database/entities/SensorData.entity';
import { Station } from '../database/entities/Station.entity';
import {
  HistoryGranularity,
  SensorStatsQueryDto,
  StationHistoryQueryDto,
} from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Station)
    private readonly stationRepo: Repository<Station>,
    @InjectRepository(Sensor)
    private readonly sensorRepo: Repository<Sensor>,
    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,
    @InjectRepository(Maintenance)
    private readonly maintenanceRepo: Repository<Maintenance>,
    @InjectRepository(SensorData)
    private readonly sensorDataRepo: Repository<SensorData>,
  ) {}

  // ─── Overview ────────────────────────────────────────────────────────────────

  async getOverview() {
    const [
      totalStations,
      activeSensors,
      openAlerts,
      maintenancePending,
    ] = await Promise.all([
      this.stationRepo.count(),
      this.sensorRepo.count({ where: { status: SensorStatus.ACTIVE } }),
      this.alertRepo.count({ where: { status: AlertStatus.ACTIVE } }),
      this.maintenanceRepo
        .createQueryBuilder('m')
        .where('m.status IN (:...statuses)', {
          statuses: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS],
        })
        .getCount(),
    ]);

    // Station breakdown by status
    const stationsByStatus: { status: string; count: string }[] =
      await this.stationRepo
        .createQueryBuilder('s')
        .select('s.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('s.status')
        .getRawMany();

    // Alert breakdown by severity (active only)
    const alertsBySeverity: { severity: string; count: string }[] =
      await this.alertRepo
        .createQueryBuilder('a')
        .select('a.severity', 'severity')
        .addSelect('COUNT(*)', 'count')
        .where('a.status = :status', { status: AlertStatus.ACTIVE })
        .groupBy('a.severity')
        .getRawMany();

    return {
      totalStations,
      activeSensors,
      openAlerts,
      maintenancePending,
      stationsByStatus: stationsByStatus.map((r) => ({
        status: r.status,
        count: Number(r.count),
      })),
      alertsBySeverity: alertsBySeverity.map((r) => ({
        severity: r.severity,
        count: Number(r.count),
      })),
    };
  }

  // ─── Sensor Stats ─────────────────────────────────────────────────────────────

  async getSensorStats(sensorId: string, query: SensorStatsQueryDto) {
    const sensor = await this.sensorRepo.findOne({
      where: { id: sensorId },
      relations: ['station'],
    });
    if (!sensor) return null;

    const now = new Date();
    const from = query.from ? new Date(query.from) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : now;

    const raw: {
      avg: string | null;
      min: string | null;
      max: string | null;
      count: string;
      stddev: string | null;
    } | undefined = await this.sensorDataRepo
      .createQueryBuilder('sd')
      .select('AVG(sd.value)', 'avg')
      .addSelect('MIN(sd.value)', 'min')
      .addSelect('MAX(sd.value)', 'max')
      .addSelect('COUNT(*)', 'count')
      .addSelect('STDDEV(sd.value)', 'stddev')
      .where('sd.sensor_id = :sensorId', { sensorId })
      .andWhere('sd.timestamp >= :from', { from })
      .andWhere('sd.timestamp <= :to', { to })
      .getRawOne();

    // Time-series: hourly buckets for the chart
    const buckets: { bucket: string; avg: string; min: string; max: string }[] =
      await this.sensorDataRepo
        .createQueryBuilder('sd')
        .select("DATE_TRUNC('hour', sd.timestamp)", 'bucket')
        .addSelect('AVG(sd.value)', 'avg')
        .addSelect('MIN(sd.value)', 'min')
        .addSelect('MAX(sd.value)', 'max')
        .where('sd.sensor_id = :sensorId', { sensorId })
        .andWhere('sd.timestamp >= :from', { from })
        .andWhere('sd.timestamp <= :to', { to })
        .groupBy('bucket')
        .orderBy('bucket', 'ASC')
        .getRawMany();

    return {
      sensor: {
        id: sensor.id,
        name: sensor.name,
        unit: sensor.unit,
        type: sensor.type,
        status: sensor.status,
        minThreshold: sensor.minThreshold,
        maxThreshold: sensor.maxThreshold,
        station: sensor.station
          ? { id: sensor.station.id, name: sensor.station.name }
          : null,
      },
      period: { from, to },
      stats: {
        avg: raw?.avg != null ? Number(Number(raw.avg).toFixed(4)) : null,
        min: raw?.min != null ? Number(Number(raw.min).toFixed(4)) : null,
        max: raw?.max != null ? Number(Number(raw.max).toFixed(4)) : null,
        count: raw?.count != null ? Number(raw.count) : 0,
        stddev: raw?.stddev != null ? Number(Number(raw.stddev).toFixed(4)) : null,
      },
      timeSeries: buckets.map((b) => ({
        time: b.bucket,
        avg: Number(Number(b.avg).toFixed(4)),
        min: Number(Number(b.min).toFixed(4)),
        max: Number(Number(b.max).toFixed(4)),
      })),
    };
  }

  // ─── Station History ──────────────────────────────────────────────────────────

  async getStationHistory(stationId: string, query: StationHistoryQueryDto) {
    const station = await this.stationRepo.findOne({
      where: { id: stationId },
      relations: ['sensors'],
    });
    if (!station) return null;

    const now = new Date();
    const defaultHours = query.granularity === HistoryGranularity.DAY ? 30 * 24 : 24;
    const from = query.from
      ? new Date(query.from)
      : new Date(now.getTime() - defaultHours * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : now;
    const trunc = query.granularity === HistoryGranularity.DAY ? 'day' : 'hour';

    const rows: {
      sensor_id: string;
      sensor_name: string;
      unit: string;
      bucket: string;
      avg: string;
      min: string;
      max: string;
      cnt: string;
    }[] = await this.sensorDataRepo
      .createQueryBuilder('sd')
      .innerJoin('sd.sensor', 's')
      .select('s.id', 'sensor_id')
      .addSelect('s.name', 'sensor_name')
      .addSelect('s.unit', 'unit')
      .addSelect(`DATE_TRUNC('${trunc}', sd.timestamp)`, 'bucket')
      .addSelect('AVG(sd.value)', 'avg')
      .addSelect('MIN(sd.value)', 'min')
      .addSelect('MAX(sd.value)', 'max')
      .addSelect('COUNT(*)', 'cnt')
      .where('s.station_id = :stationId', { stationId })
      .andWhere('sd.timestamp >= :from', { from })
      .andWhere('sd.timestamp <= :to', { to })
      .groupBy('s.id, s.name, s.unit, bucket')
      .orderBy('bucket', 'ASC')
      .getRawMany();

    // Group by sensor
    const bySensor = new Map<
      string,
      { sensorId: string; sensorName: string; unit: string; buckets: unknown[] }
    >();

    for (const row of rows) {
      if (!bySensor.has(row.sensor_id)) {
        bySensor.set(row.sensor_id, {
          sensorId: row.sensor_id,
          sensorName: row.sensor_name,
          unit: row.unit,
          buckets: [],
        });
      }
      bySensor.get(row.sensor_id)!.buckets.push({
        time: row.bucket,
        avg: Number(Number(row.avg).toFixed(4)),
        min: Number(Number(row.min).toFixed(4)),
        max: Number(Number(row.max).toFixed(4)),
        count: Number(row.cnt),
      });
    }

    return {
      station: { id: station.id, name: station.name, status: station.status },
      period: { from, to, granularity: trunc },
      sensors: Array.from(bySensor.values()),
    };
  }
}
