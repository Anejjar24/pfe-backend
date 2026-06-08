import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Alert, AlertStatus } from '../database/entities/Alert.entity';
import { Maintenance, MaintenanceStatus } from '../database/entities/Maintenance.entity';
import { Sensor, SensorStatus } from '../database/entities/Sensor.entity';
import { SensorAggregate } from '../database/entities/SensorAggregate.entity';
import { SensorData } from '../database/entities/SensorData.entity';
import { Station } from '../database/entities/Station.entity';
import {
  GRANULARITY_INTERVAL,
  HistoryGranularity,
  SensorStatsQueryDto,
  StationHistoryQueryDto,
} from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
    @InjectRepository(SensorAggregate)
    private readonly aggregateRepo: Repository<SensorAggregate>,
  ) {}

  // ─── Overview ────────────────────────────────────────────────────────────────

  async getOverview() {
    const [totalStations, activeSensors, openAlerts, maintenancePending] =
      await Promise.all([
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

    const [stationsByStatus, alertsBySeverity] = await Promise.all([
      this.stationRepo
        .createQueryBuilder('s')
        .select('s.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('s.status')
        .getRawMany<{ status: string; count: string }>(),

      this.alertRepo
        .createQueryBuilder('a')
        .select('a.severity', 'severity')
        .addSelect('COUNT(*)', 'count')
        .where('a.status = :status', { status: AlertStatus.ACTIVE })
        .groupBy('a.severity')
        .getRawMany<{ severity: string; count: string }>(),
    ]);

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

  // ─── Sensor Stats (uses time_bucket + continuous aggregates when available) ──

  async getSensorStats(sensorId: string, query: SensorStatsQueryDto) {
    const sensor = await this.sensorRepo.findOne({
      where: { id: sensorId },
      relations: ['station'],
    });
    if (!sensor) return null;

    const now = new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : now;
    const granularity = query.granularity ?? HistoryGranularity.HOUR;
    const interval = GRANULARITY_INTERVAL[granularity];

    // ── Overall stats ──────────────────────────────────────────────────────
    const [raw] = await this.dataSource.query<
      { avg: string; min: string; max: string; count: string; stddev: string }[]
    >(
      `SELECT
          AVG(value)    AS avg,
          MIN(value)    AS min,
          MAX(value)    AS max,
          COUNT(*)      AS count,
          STDDEV(value) AS stddev
       FROM sensor_data
       WHERE sensor_id = $1
         AND timestamp >= $2
         AND timestamp <= $3`,
      [sensorId, from, to],
    );

    // ── Time-series buckets using time_bucket ─────────────────────────────
    // For hour/day granularity try to read from the continuous aggregate first
    // (pre-computed, ~100× faster at scale). Fall back to raw if not available.
    let timeSeries: { time: string; avg: number; min: number; max: number; stddev: number | null; count: number }[];

    if (granularity === HistoryGranularity.HOUR) {
      timeSeries = await this.querySensorHourlyView(sensorId, from, to);
    } else if (granularity === HistoryGranularity.DAY) {
      timeSeries = await this.querySensorDailyView(sensorId, from, to);
    } else {
      // Sub-hour granularity — query raw sensor_data with time_bucket
      timeSeries = await this.querySensorTimeBucket(sensorId, from, to, interval);
    }

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
      period: { from, to, granularity, interval },
      stats: {
        avg:    raw?.avg    != null ? round4(raw.avg)    : null,
        min:    raw?.min    != null ? round4(raw.min)    : null,
        max:    raw?.max    != null ? round4(raw.max)    : null,
        count:  raw?.count  != null ? Number(raw.count)  : 0,
        stddev: raw?.stddev != null ? round4(raw.stddev) : null,
      },
      timeSeries,
    };
  }

  // ─── Station History (time_bucket + continuous aggregates) ────────────────

  async getStationHistory(stationId: string, query: StationHistoryQueryDto) {
    const station = await this.stationRepo.findOne({
      where: { id: stationId },
      relations: ['sensors'],
    });
    if (!station) return null;

    const now = new Date();
    const granularity = query.granularity ?? HistoryGranularity.HOUR;
    const interval = GRANULARITY_INTERVAL[granularity];
    const defaultHours =
      granularity === HistoryGranularity.DAY ? 30 * 24 : 24;
    const from = query.from
      ? new Date(query.from)
      : new Date(now.getTime() - defaultHours * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : now;

    let rows: {
      sensor_id: string;
      sensor_name: string;
      unit: string;
      bucket: string;
      avg: string;
      min: string;
      max: string;
      stddev: string | null;
      cnt: string;
    }[];

    if (granularity === HistoryGranularity.HOUR) {
      rows = await this.queryStationHourlyView(stationId, from, to);
    } else if (granularity === HistoryGranularity.DAY) {
      rows = await this.queryStationDailyView(stationId, from, to);
    } else {
      rows = await this.queryStationTimeBucket(stationId, from, to, interval);
    }

    // Group by sensor
    const bySensor = new Map<
      string,
      { sensorId: string; sensorName: string; unit: string; buckets: unknown[] }
    >();

    for (const row of rows) {
      if (!bySensor.has(row.sensor_id)) {
        bySensor.set(row.sensor_id, {
          sensorId:   row.sensor_id,
          sensorName: row.sensor_name,
          unit:       row.unit,
          buckets:    [],
        });
      }
      bySensor.get(row.sensor_id)!.buckets.push({
        time:   row.bucket,
        avg:    round4(row.avg),
        min:    round4(row.min),
        max:    round4(row.max),
        stddev: row.stddev != null ? round4(row.stddev) : null,
        count:  Number(row.cnt),
      });
    }

    return {
      station: { id: station.id, name: station.name, status: station.status },
      period:  { from, to, granularity, interval },
      sensors: Array.from(bySensor.values()),
    };
  }

  // ─── System metrics (reads from continuous aggregates directly) ───────────

  async getSystemMetrics(hours = 24) {
    const from = new Date(Date.now() - hours * 60 * 60 * 1000);

    try {
      // Reads per sensor over the window — from hourly continuous aggregate
      const perSensor = await this.dataSource.query<
        { sensor_id: string; total_readings: string; avg_value: string }[]
      >(
        `SELECT
            sensor_id,
            SUM(reading_count) AS total_readings,
            AVG(avg_value)     AS avg_value
           FROM sensor_data_hourly
          WHERE bucket >= $1
          GROUP BY sensor_id
          ORDER BY total_readings DESC
          LIMIT 20`,
        [from],
      );

      // Total readings in window
      const [{ total }] = await this.dataSource.query<{ total: string }[]>(
        `SELECT COALESCE(SUM(reading_count), 0) AS total
           FROM sensor_data_hourly
          WHERE bucket >= $1`,
        [from],
      );

      return {
        windowHours: hours,
        from,
        totalReadings: Number(total),
        topSensors: perSensor.map((r) => ({
          sensorId:     r.sensor_id,
          totalReadings: Number(r.total_readings),
          avgValue:     round4(r.avg_value),
        })),
      };
    } catch {
      // Continuous aggregate not yet available — return empty metrics
      this.logger.warn('sensor_data_hourly view not available — system metrics skipped');
      return { windowHours: hours, from, totalReadings: 0, topSensors: [] };
    }
  }

  // ─── Pre-computed KPIs (from Spark sensor_aggregates table) ─────────────

  async getKpis(granularity: 'hourly' | 'daily' = 'hourly', hours = 24) {
    const from = new Date(Date.now() - hours * 60 * 60 * 1000);

    try {
      const rows = await this.dataSource.query<{
        sensor_id: string;
        station_id: string;
        bucket: string;
        avg_value: string;
        min_value: string;
        max_value: string;
        stddev_value: string | null;
        reading_count: string;
        anomaly_flag: boolean;
        rolling_mean: string | null;
        rolling_stddev: string | null;
      }[]>(
        `SELECT sensor_id, station_id, bucket,
                avg_value, min_value, max_value, stddev_value,
                reading_count, anomaly_flag, rolling_mean, rolling_stddev
           FROM sensor_aggregates
          WHERE granularity = $1
            AND bucket >= $2
          ORDER BY bucket DESC
          LIMIT 500`,
        [granularity, from],
      );

      // Aggregate anomaly counts per station for the frontend chart
      const anomalyByStation: Record<string, number> = {};
      let totalAnomalies = 0;
      for (const r of rows) {
        if (r.anomaly_flag) {
          anomalyByStation[r.station_id] = (anomalyByStation[r.station_id] ?? 0) + 1;
          totalAnomalies++;
        }
      }

      return {
        granularity,
        windowHours: hours,
        from,
        totalBuckets: rows.length,
        totalAnomalies,
        anomalyByStation,
        rows: rows.map((r) => ({
          sensorId:     r.sensor_id,
          stationId:    r.station_id,
          bucket:       r.bucket,
          avgValue:     r.avg_value    != null ? round4(r.avg_value)    : null,
          minValue:     r.min_value    != null ? round4(r.min_value)    : null,
          maxValue:     r.max_value    != null ? round4(r.max_value)    : null,
          stddevValue:  r.stddev_value != null ? round4(r.stddev_value) : null,
          readingCount: r.reading_count != null ? Number(r.reading_count) : 0,
          anomalyFlag:  r.anomaly_flag,
          rollingMean:  r.rolling_mean   != null ? round4(r.rolling_mean)   : null,
          rollingStddev: r.rolling_stddev != null ? round4(r.rolling_stddev) : null,
        })),
      };
    } catch {
      this.logger.warn('sensor_aggregates table not yet populated — returning empty KPIs');
      return {
        granularity,
        windowHours: hours,
        from,
        totalBuckets: 0,
        totalAnomalies: 0,
        anomalyByStation: {},
        rows: [],
      };
    }
  }

  // ─── Private query helpers ────────────────────────────────────────────────

  /** time_bucket on raw sensor_data — used for sub-hour granularities. */
  private async querySensorTimeBucket(
    sensorId: string,
    from: Date,
    to: Date,
    interval: string,
  ) {
    const rows = await this.dataSource.query<
      { bucket: string; avg: string; min: string; max: string; stddev: string | null; cnt: string }[]
    >(
      `SELECT
          time_bucket($1::interval, timestamp) AS bucket,
          AVG(value)    AS avg,
          MIN(value)    AS min,
          MAX(value)    AS max,
          STDDEV(value) AS stddev,
          COUNT(*)      AS cnt
         FROM sensor_data
        WHERE sensor_id = $2
          AND timestamp >= $3
          AND timestamp <= $4
        GROUP BY bucket
        ORDER BY bucket ASC`,
      [interval, sensorId, from, to],
    );
    return rows.map(mapBucketRow);
  }

  /** Read from sensor_data_hourly continuous aggregate. */
  private async querySensorHourlyView(sensorId: string, from: Date, to: Date) {
    try {
      const rows = await this.dataSource.query<
        { bucket: string; avg_value: string; min_value: string; max_value: string; stddev_value: string | null; reading_count: string }[]
      >(
        `SELECT bucket, avg_value, min_value, max_value, stddev_value, reading_count
           FROM sensor_data_hourly
          WHERE sensor_id = $1
            AND bucket >= $2
            AND bucket <= $3
          ORDER BY bucket ASC`,
        [sensorId, from, to],
      );
      return rows.map((r) => ({
        time:   r.bucket,
        avg:    round4(r.avg_value),
        min:    round4(r.min_value),
        max:    round4(r.max_value),
        stddev: r.stddev_value != null ? round4(r.stddev_value) : null,
        count:  Number(r.reading_count),
      }));
    } catch {
      this.logger.warn('sensor_data_hourly view unavailable — falling back to time_bucket query');
      return this.querySensorTimeBucket(sensorId, from, to, '1 hour');
    }
  }

  /** Read from sensor_data_daily continuous aggregate. */
  private async querySensorDailyView(sensorId: string, from: Date, to: Date) {
    try {
      const rows = await this.dataSource.query<
        { bucket: string; avg_value: string; min_value: string; max_value: string; stddev_value: string | null; reading_count: string }[]
      >(
        `SELECT bucket, avg_value, min_value, max_value, stddev_value, reading_count
           FROM sensor_data_daily
          WHERE sensor_id = $1
            AND bucket >= $2
            AND bucket <= $3
          ORDER BY bucket ASC`,
        [sensorId, from, to],
      );
      return rows.map((r) => ({
        time:   r.bucket,
        avg:    round4(r.avg_value),
        min:    round4(r.min_value),
        max:    round4(r.max_value),
        stddev: r.stddev_value != null ? round4(r.stddev_value) : null,
        count:  Number(r.reading_count),
      }));
    } catch {
      this.logger.warn('sensor_data_daily view unavailable — falling back to time_bucket query');
      return this.querySensorTimeBucket(sensorId, from, to, '1 day');
    }
  }

  private async queryStationTimeBucket(
    stationId: string,
    from: Date,
    to: Date,
    interval: string,
  ) {
    return this.dataSource.query<any[]>(
      `SELECT
          s.id                                   AS sensor_id,
          s.name                                 AS sensor_name,
          s.unit                                 AS unit,
          time_bucket($1::interval, sd.timestamp) AS bucket,
          AVG(sd.value)    AS avg,
          MIN(sd.value)    AS min,
          MAX(sd.value)    AS max,
          STDDEV(sd.value) AS stddev,
          COUNT(*)         AS cnt
         FROM sensor_data sd
         JOIN sensors s ON s.id = sd.sensor_id
        WHERE s.station_id = $2
          AND sd.timestamp >= $3
          AND sd.timestamp <= $4
        GROUP BY s.id, s.name, s.unit, bucket
        ORDER BY bucket ASC`,
      [interval, stationId, from, to],
    );
  }

  private async queryStationHourlyView(stationId: string, from: Date, to: Date) {
    try {
      return await this.dataSource.query<any[]>(
        `SELECT
            s.id         AS sensor_id,
            s.name       AS sensor_name,
            s.unit       AS unit,
            h.bucket     AS bucket,
            h.avg_value  AS avg,
            h.min_value  AS min,
            h.max_value  AS max,
            h.stddev_value AS stddev,
            h.reading_count AS cnt
           FROM sensor_data_hourly h
           JOIN sensors s ON s.id = h.sensor_id
          WHERE s.station_id = $1
            AND h.bucket >= $2
            AND h.bucket <= $3
          ORDER BY h.bucket ASC`,
        [stationId, from, to],
      );
    } catch {
      this.logger.warn('sensor_data_hourly unavailable — falling back to time_bucket');
      return this.queryStationTimeBucket(stationId, from, to, '1 hour');
    }
  }

  private async queryStationDailyView(stationId: string, from: Date, to: Date) {
    try {
      return await this.dataSource.query<any[]>(
        `SELECT
            s.id         AS sensor_id,
            s.name       AS sensor_name,
            s.unit       AS unit,
            d.bucket     AS bucket,
            d.avg_value  AS avg,
            d.min_value  AS min,
            d.max_value  AS max,
            d.stddev_value AS stddev,
            d.reading_count AS cnt
           FROM sensor_data_daily d
           JOIN sensors s ON s.id = d.sensor_id
          WHERE s.station_id = $1
            AND d.bucket >= $2
            AND d.bucket <= $3
          ORDER BY d.bucket ASC`,
        [stationId, from, to],
      );
    } catch {
      this.logger.warn('sensor_data_daily unavailable — falling back to time_bucket');
      return this.queryStationTimeBucket(stationId, from, to, '1 day');
    }
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function round4(v: string | number | null | undefined): number {
  if (v == null) return 0;
  return Number(Number(v).toFixed(4));
}

function mapBucketRow(r: {
  bucket: string;
  avg: string;
  min: string;
  max: string;
  stddev: string | null;
  cnt: string;
}) {
  return {
    time:   r.bucket,
    avg:    round4(r.avg),
    min:    round4(r.min),
    max:    round4(r.max),
    stddev: r.stddev != null ? round4(r.stddev) : null,
    count:  Number(r.cnt),
  };
}
