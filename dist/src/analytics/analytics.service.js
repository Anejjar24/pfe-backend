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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Alert_entity_1 = require("../database/entities/Alert.entity");
const Maintenance_entity_1 = require("../database/entities/Maintenance.entity");
const Sensor_entity_1 = require("../database/entities/Sensor.entity");
const SensorData_entity_1 = require("../database/entities/SensorData.entity");
const Station_entity_1 = require("../database/entities/Station.entity");
const analytics_query_dto_1 = require("./dto/analytics-query.dto");
let AnalyticsService = class AnalyticsService {
    constructor(stationRepo, sensorRepo, alertRepo, maintenanceRepo, sensorDataRepo) {
        this.stationRepo = stationRepo;
        this.sensorRepo = sensorRepo;
        this.alertRepo = alertRepo;
        this.maintenanceRepo = maintenanceRepo;
        this.sensorDataRepo = sensorDataRepo;
    }
    async getOverview() {
        const [totalStations, activeSensors, openAlerts, maintenancePending,] = await Promise.all([
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
        const stationsByStatus = await this.stationRepo
            .createQueryBuilder('s')
            .select('s.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('s.status')
            .getRawMany();
        const alertsBySeverity = await this.alertRepo
            .createQueryBuilder('a')
            .select('a.severity', 'severity')
            .addSelect('COUNT(*)', 'count')
            .where('a.status = :status', { status: Alert_entity_1.AlertStatus.ACTIVE })
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
    async getSensorStats(sensorId, query) {
        const sensor = await this.sensorRepo.findOne({
            where: { id: sensorId },
            relations: ['station'],
        });
        if (!sensor)
            return null;
        const now = new Date();
        const from = query.from ? new Date(query.from) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const to = query.to ? new Date(query.to) : now;
        const raw = await this.sensorDataRepo
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
        const buckets = await this.sensorDataRepo
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
    async getStationHistory(stationId, query) {
        const station = await this.stationRepo.findOne({
            where: { id: stationId },
            relations: ['sensors'],
        });
        if (!station)
            return null;
        const now = new Date();
        const defaultHours = query.granularity === analytics_query_dto_1.HistoryGranularity.DAY ? 30 * 24 : 24;
        const from = query.from
            ? new Date(query.from)
            : new Date(now.getTime() - defaultHours * 60 * 60 * 1000);
        const to = query.to ? new Date(query.to) : now;
        const trunc = query.granularity === analytics_query_dto_1.HistoryGranularity.DAY ? 'day' : 'hour';
        const rows = await this.sensorDataRepo
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Station_entity_1.Station)),
    __param(1, (0, typeorm_1.InjectRepository)(Sensor_entity_1.Sensor)),
    __param(2, (0, typeorm_1.InjectRepository)(Alert_entity_1.Alert)),
    __param(3, (0, typeorm_1.InjectRepository)(Maintenance_entity_1.Maintenance)),
    __param(4, (0, typeorm_1.InjectRepository)(SensorData_entity_1.SensorData)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map