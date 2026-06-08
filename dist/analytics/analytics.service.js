"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Alert_entity_1 = require("../database/entities/Alert.entity");
const Maintenance_entity_1 = require("../database/entities/Maintenance.entity");
const Sensor_entity_1 = require("../database/entities/Sensor.entity");
const SensorAggregate_entity_1 = require("../database/entities/SensorAggregate.entity");
const SensorData_entity_1 = require("../database/entities/SensorData.entity");
const Station_entity_1 = require("../database/entities/Station.entity");
const analytics_query_dto_1 = require("./dto/analytics-query.dto");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor(dataSource, stationRepo, sensorRepo, alertRepo, maintenanceRepo, sensorDataRepo, aggregateRepo) {
        this.dataSource = dataSource;
        this.stationRepo = stationRepo;
        this.sensorRepo = sensorRepo;
        this.alertRepo = alertRepo;
        this.maintenanceRepo = maintenanceRepo;
        this.sensorDataRepo = sensorDataRepo;
        this.aggregateRepo = aggregateRepo;
        this.logger = new common_1.Logger(AnalyticsService_1.name);
    }
    async getOverview() {
        const [totalStations, activeSensors, openAlerts, maintenancePending] = await Promise.all([
            this.stationRepo.count(),
            this.sensorRepo.count({ where: { status: Sensor_entity_1.SensorStatus.ACTIVE } }),
            this.alertRepo.count({ where: { status: Alert_entity_1.AlertStatus.ACTIVE } }),
            this.maintenanceRepo
                .createQueryBuilder('m')
                .where('m.status IN (:...statuses)', {
                statuses: [Maintenance_entity_1.MaintenanceStatus.SCHEDULED, Maintenance_entity_1.MaintenanceStatus.IN_PROGRESS],
            })
                .getCount(),
        ]);
        const [stationsByStatus, alertsBySeverity] = await Promise.all([
            this.stationRepo
                .createQueryBuilder('s')
                .select('s.status', 'status')
                .addSelect('COUNT(*)', 'count')
                .groupBy('s.status')
                .getRawMany(),
            this.alertRepo
                .createQueryBuilder('a')
                .select('a.severity', 'severity')
                .addSelect('COUNT(*)', 'count')
                .where('a.status = :status', { status: Alert_entity_1.AlertStatus.ACTIVE })
                .groupBy('a.severity')
                .getRawMany(),
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
    async getSensorStats(sensorId, query) {
        const sensor = await this.sensorRepo.findOne({
            where: { id: sensorId },
            relations: ['station'],
        });
        if (!sensor)
            return null;
        const now = new Date();
        const from = query.from
            ? new Date(query.from)
            : new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const to = query.to ? new Date(query.to) : now;
        const granularity = query.granularity ?? analytics_query_dto_1.HistoryGranularity.HOUR;
        const interval = analytics_query_dto_1.GRANULARITY_INTERVAL[granularity];
        const [raw] = await this.dataSource.query(`SELECT
          AVG(value)    AS avg,
          MIN(value)    AS min,
          MAX(value)    AS max,
          COUNT(*)      AS count,
          STDDEV(value) AS stddev
       FROM sensor_data
       WHERE sensor_id = $1
         AND timestamp >= $2
         AND timestamp <= $3`, [sensorId, from, to]);
        let timeSeries;
        if (granularity === analytics_query_dto_1.HistoryGranularity.HOUR) {
            timeSeries = await this.querySensorHourlyView(sensorId, from, to);
        }
        else if (granularity === analytics_query_dto_1.HistoryGranularity.DAY) {
            timeSeries = await this.querySensorDailyView(sensorId, from, to);
        }
        else {
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
                avg: raw?.avg != null ? round4(raw.avg) : null,
                min: raw?.min != null ? round4(raw.min) : null,
                max: raw?.max != null ? round4(raw.max) : null,
                count: raw?.count != null ? Number(raw.count) : 0,
                stddev: raw?.stddev != null ? round4(raw.stddev) : null,
            },
            timeSeries,
        };
    }
    async getStationHistory(stationId, query) {
        const station = await this.stationRepo.findOne({
            where: { id: stationId },
            relations: ['sensors'],
        });
        if (!station)
            return null;
        const now = new Date();
        const granularity = query.granularity ?? analytics_query_dto_1.HistoryGranularity.HOUR;
        const interval = analytics_query_dto_1.GRANULARITY_INTERVAL[granularity];
        const defaultHours = granularity === analytics_query_dto_1.HistoryGranularity.DAY ? 30 * 24 : 24;
        const from = query.from
            ? new Date(query.from)
            : new Date(now.getTime() - defaultHours * 60 * 60 * 1000);
        const to = query.to ? new Date(query.to) : now;
        let rows;
        if (granularity === analytics_query_dto_1.HistoryGranularity.HOUR) {
            rows = await this.queryStationHourlyView(stationId, from, to);
        }
        else if (granularity === analytics_query_dto_1.HistoryGranularity.DAY) {
            rows = await this.queryStationDailyView(stationId, from, to);
        }
        else {
            rows = await this.queryStationTimeBucket(stationId, from, to, interval);
        }
        const bySensor = new Map();
        for (const row of rows) {
            if (!bySensor.has(row.sensor_id)) {
                bySensor.set(row.sensor_id, {
                    sensorId: row.sensor_id,
                    sensorName: row.sensor_name,
                    unit: row.unit,
                    buckets: [],
                });
            }
            bySensor.get(row.sensor_id).buckets.push({
                time: row.bucket,
                avg: round4(row.avg),
                min: round4(row.min),
                max: round4(row.max),
                stddev: row.stddev != null ? round4(row.stddev) : null,
                count: Number(row.cnt),
            });
        }
        return {
            station: { id: station.id, name: station.name, status: station.status },
            period: { from, to, granularity, interval },
            sensors: Array.from(bySensor.values()),
        };
    }
    async getSystemMetrics(hours = 24) {
        const from = new Date(Date.now() - hours * 60 * 60 * 1000);
        try {
            const perSensor = await this.dataSource.query(`SELECT
            sensor_id,
            SUM(reading_count) AS total_readings,
            AVG(avg_value)     AS avg_value
           FROM sensor_data_hourly
          WHERE bucket >= $1
          GROUP BY sensor_id
          ORDER BY total_readings DESC
          LIMIT 20`, [from]);
            const [{ total }] = await this.dataSource.query(`SELECT COALESCE(SUM(reading_count), 0) AS total
           FROM sensor_data_hourly
          WHERE bucket >= $1`, [from]);
            return {
                windowHours: hours,
                from,
                totalReadings: Number(total),
                topSensors: perSensor.map((r) => ({
                    sensorId: r.sensor_id,
                    totalReadings: Number(r.total_readings),
                    avgValue: round4(r.avg_value),
                })),
            };
        }
        catch {
            this.logger.warn('sensor_data_hourly view not available — system metrics skipped');
            return { windowHours: hours, from, totalReadings: 0, topSensors: [] };
        }
    }
    async getKpis(granularity = 'hourly', hours = 24) {
        const from = new Date(Date.now() - hours * 60 * 60 * 1000);
        try {
            const rows = await this.dataSource.query(`SELECT sensor_id, station_id, bucket,
                avg_value, min_value, max_value, stddev_value,
                reading_count, anomaly_flag, rolling_mean, rolling_stddev
           FROM sensor_aggregates
          WHERE granularity = $1
            AND bucket >= $2
          ORDER BY bucket DESC
          LIMIT 500`, [granularity, from]);
            const anomalyByStation = {};
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
                    sensorId: r.sensor_id,
                    stationId: r.station_id,
                    bucket: r.bucket,
                    avgValue: r.avg_value != null ? round4(r.avg_value) : null,
                    minValue: r.min_value != null ? round4(r.min_value) : null,
                    maxValue: r.max_value != null ? round4(r.max_value) : null,
                    stddevValue: r.stddev_value != null ? round4(r.stddev_value) : null,
                    readingCount: r.reading_count != null ? Number(r.reading_count) : 0,
                    anomalyFlag: r.anomaly_flag,
                    rollingMean: r.rolling_mean != null ? round4(r.rolling_mean) : null,
                    rollingStddev: r.rolling_stddev != null ? round4(r.rolling_stddev) : null,
                })),
            };
        }
        catch {
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
    async querySensorTimeBucket(sensorId, from, to, interval) {
        const rows = await this.dataSource.query(`SELECT
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
        ORDER BY bucket ASC`, [interval, sensorId, from, to]);
        return rows.map(mapBucketRow);
    }
    async querySensorHourlyView(sensorId, from, to) {
        try {
            const rows = await this.dataSource.query(`SELECT bucket, avg_value, min_value, max_value, stddev_value, reading_count
           FROM sensor_data_hourly
          WHERE sensor_id = $1
            AND bucket >= $2
            AND bucket <= $3
          ORDER BY bucket ASC`, [sensorId, from, to]);
            return rows.map((r) => ({
                time: r.bucket,
                avg: round4(r.avg_value),
                min: round4(r.min_value),
                max: round4(r.max_value),
                stddev: r.stddev_value != null ? round4(r.stddev_value) : null,
                count: Number(r.reading_count),
            }));
        }
        catch {
            this.logger.warn('sensor_data_hourly view unavailable — falling back to time_bucket query');
            return this.querySensorTimeBucket(sensorId, from, to, '1 hour');
        }
    }
    async querySensorDailyView(sensorId, from, to) {
        try {
            const rows = await this.dataSource.query(`SELECT bucket, avg_value, min_value, max_value, stddev_value, reading_count
           FROM sensor_data_daily
          WHERE sensor_id = $1
            AND bucket >= $2
            AND bucket <= $3
          ORDER BY bucket ASC`, [sensorId, from, to]);
            return rows.map((r) => ({
                time: r.bucket,
                avg: round4(r.avg_value),
                min: round4(r.min_value),
                max: round4(r.max_value),
                stddev: r.stddev_value != null ? round4(r.stddev_value) : null,
                count: Number(r.reading_count),
            }));
        }
        catch {
            this.logger.warn('sensor_data_daily view unavailable — falling back to time_bucket query');
            return this.querySensorTimeBucket(sensorId, from, to, '1 day');
        }
    }
    async queryStationTimeBucket(stationId, from, to, interval) {
        return this.dataSource.query(`SELECT
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
        ORDER BY bucket ASC`, [interval, stationId, from, to]);
    }
    async queryStationHourlyView(stationId, from, to) {
        try {
            return await this.dataSource.query(`SELECT
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
          ORDER BY h.bucket ASC`, [stationId, from, to]);
        }
        catch {
            this.logger.warn('sensor_data_hourly unavailable — falling back to time_bucket');
            return this.queryStationTimeBucket(stationId, from, to, '1 hour');
        }
    }
    async queryStationDailyView(stationId, from, to) {
        try {
            return await this.dataSource.query(`SELECT
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
          ORDER BY d.bucket ASC`, [stationId, from, to]);
        }
        catch {
            this.logger.warn('sensor_data_daily unavailable — falling back to time_bucket');
            return this.queryStationTimeBucket(stationId, from, to, '1 day');
        }
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __param(1, (0, typeorm_1.InjectRepository)(Station_entity_1.Station)),
    __param(2, (0, typeorm_1.InjectRepository)(Sensor_entity_1.Sensor)),
    __param(3, (0, typeorm_1.InjectRepository)(Alert_entity_1.Alert)),
    __param(4, (0, typeorm_1.InjectRepository)(Maintenance_entity_1.Maintenance)),
    __param(5, (0, typeorm_1.InjectRepository)(SensorData_entity_1.SensorData)),
    __param(6, (0, typeorm_1.InjectRepository)(SensorAggregate_entity_1.SensorAggregate)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
function round4(v) {
    if (v == null)
        return 0;
    return Number(Number(v).toFixed(4));
}
function mapBucketRow(r) {
    return {
        time: r.bucket,
        avg: round4(r.avg),
        min: round4(r.min),
        max: round4(r.max),
        stddev: r.stddev != null ? round4(r.stddev) : null,
        count: Number(r.cnt),
    };
}
//# sourceMappingURL=analytics.service.js.map