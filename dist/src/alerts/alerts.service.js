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
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Alert_entity_1 = require("../database/entities/Alert.entity");
const Sensor_entity_1 = require("../database/entities/Sensor.entity");
const Station_entity_1 = require("../database/entities/Station.entity");
const realtime_service_1 = require("../realtime/realtime.service");
const notifications_service_1 = require("../notifications/notifications.service");
let AlertsService = class AlertsService {
    constructor(alertRepository, stationRepository, sensorRepository, realtimeService, notificationsService) {
        this.alertRepository = alertRepository;
        this.stationRepository = stationRepository;
        this.sensorRepository = sensorRepository;
        this.realtimeService = realtimeService;
        this.notificationsService = notificationsService;
    }
    async create(dto) {
        const station = dto.stationId
            ? await this.stationRepository.findOne({ where: { id: dto.stationId } })
            : null;
        const sensor = dto.sensorId
            ? await this.sensorRepository.findOne({ where: { id: dto.sensorId } })
            : null;
        if (dto.stationId && !station)
            throw new common_1.NotFoundException(`Station "${dto.stationId}" was not found`);
        if (dto.sensorId && !sensor)
            throw new common_1.NotFoundException(`Sensor "${dto.sensorId}" was not found`);
        const alert = await this.alertRepository.save(this.alertRepository.create({
            type: dto.type,
            severity: dto.severity,
            message: dto.message,
            description: dto.description,
            data: dto.data,
            sourceSystem: dto.sourceSystem || 'aquaflow',
            station: station || undefined,
            sensor: sensor || undefined,
        }));
        this.realtimeService.broadcastToAll('alert-created', {
            id: alert.id,
            alertId: alert.id,
            severity: alert.severity,
            message: alert.message,
            stationId: station?.id,
            station: station?.name,
            sensorId: sensor?.id,
            timestamp: alert.createdAt,
        });
        this.notificationsService
            .notifyAlertCreated(alert, station, sensor)
            .catch(() => void 0);
        return alert;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.severity)
            where.severity = query.severity;
        if (query.type)
            where.type = query.type;
        if (query.stationId)
            where.station = { id: query.stationId };
        if (query.sensorId)
            where.sensor = { id: query.sensorId };
        const [data, total] = await this.alertRepository.findAndCount({
            where,
            relations: ['station', 'sensor', 'acknowledgedBy', 'resolvedBy'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
    }
    async findOne(id) {
        const alert = await this.alertRepository.findOne({
            where: { id },
            relations: ['station', 'sensor', 'acknowledgedBy', 'resolvedBy'],
        });
        if (!alert)
            throw new common_1.NotFoundException(`Alert "${id}" was not found`);
        return alert;
    }
    async acknowledge(id, user) {
        const alert = await this.findOne(id);
        alert.status = Alert_entity_1.AlertStatus.ACKNOWLEDGED;
        alert.acknowledgedAt = new Date();
        alert.acknowledgedBy = user;
        return this.alertRepository.save(alert);
    }
    async resolve(id, user) {
        const alert = await this.findOne(id);
        alert.status = Alert_entity_1.AlertStatus.RESOLVED;
        alert.resolvedAt = new Date();
        alert.resolvedBy = user;
        return this.alertRepository.save(alert);
    }
    async exportCsv(params) {
        const where = {};
        if (params.status)
            where.status = params.status;
        if (params.severity)
            where.severity = params.severity;
        if (params.type)
            where.type = params.type;
        if (params.stationId)
            where.station = { id: params.stationId };
        if (params.sensorId)
            where.sensor = { id: params.sensorId };
        if (params.from && params.to) {
            where.createdAt = (0, typeorm_2.Between)(new Date(params.from), new Date(params.to));
        }
        else if (params.from) {
            where.createdAt = (0, typeorm_2.MoreThanOrEqual)(new Date(params.from));
        }
        else if (params.to) {
            where.createdAt = (0, typeorm_2.LessThanOrEqual)(new Date(params.to));
        }
        const alerts = await this.alertRepository.find({
            where,
            relations: ['station', 'sensor'],
            order: { createdAt: 'DESC' },
            take: 10_000,
        });
        const esc = (v) => `"${(v ?? '').replace(/"/g, '""')}"`;
        const header = 'id,type,severity,status,message,station,sensor,createdAt,acknowledgedAt,resolvedAt,sourceSystem';
        const rows = alerts.map((a) => [
            a.id,
            a.type,
            a.severity,
            a.status,
            esc(a.message),
            esc(a.station?.name ?? ''),
            esc(a.sensor?.name ?? ''),
            a.createdAt?.toISOString() ?? '',
            a.acknowledgedAt?.toISOString() ?? '',
            a.resolvedAt?.toISOString() ?? '',
            esc(a.sourceSystem ?? ''),
        ].join(','));
        return [header, ...rows].join('\r\n');
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Alert_entity_1.Alert)),
    __param(1, (0, typeorm_1.InjectRepository)(Station_entity_1.Station)),
    __param(2, (0, typeorm_1.InjectRepository)(Sensor_entity_1.Sensor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        realtime_service_1.RealtimeService,
        notifications_service_1.NotificationsService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map