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
exports.SensorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const Sensor_entity_1 = require("../database/entities/Sensor.entity");
const SensorData_entity_1 = require("../database/entities/SensorData.entity");
const Station_entity_1 = require("../database/entities/Station.entity");
const SENSOR_LIST_TTL = 60;
const SENSOR_LIST_PREFIX = 'sensors:list:';
let SensorsService = class SensorsService {
    constructor(sensorRepository, sensorDataRepository, stationRepository, cacheManager) {
        this.sensorRepository = sensorRepository;
        this.sensorDataRepository = sensorDataRepository;
        this.stationRepository = stationRepository;
        this.cacheManager = cacheManager;
        this.listCacheKeys = new Set();
    }
    async create(dto) {
        const station = await this.stationRepository.findOne({ where: { id: dto.stationId } });
        if (!station)
            throw new common_1.NotFoundException(`Station "${dto.stationId}" was not found`);
        const { stationId, ...sensorPayload } = dto;
        const sensor = this.sensorRepository.create({ ...sensorPayload, station });
        const saved = await this.sensorRepository.save(sensor);
        await this.clearListCache();
        return saved;
    }
    async findAll(query) {
        const cacheKey = `${SENSOR_LIST_PREFIX}${JSON.stringify(query)}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {};
        if (query.stationId)
            where.station = { id: query.stationId };
        if (query.type)
            where.type = query.type;
        if (query.status)
            where.status = query.status;
        if (query.search)
            where.name = (0, typeorm_2.ILike)(`%${query.search}%`);
        const [data, total] = await this.sensorRepository.findAndCount({
            where,
            relations: ['station'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const result = { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
        await this.cacheManager.set(cacheKey, result, { ttl: SENSOR_LIST_TTL });
        this.listCacheKeys.add(cacheKey);
        return result;
    }
    async findOne(id) {
        const sensor = await this.sensorRepository.findOne({
            where: { id },
            relations: ['station', 'alerts'],
        });
        if (!sensor)
            throw new common_1.NotFoundException(`Sensor "${id}" was not found`);
        return sensor;
    }
    async update(id, dto) {
        const sensor = await this.findOne(id);
        const { stationId, ...sensorPayload } = dto;
        Object.assign(sensor, sensorPayload);
        if (stationId) {
            const station = await this.stationRepository.findOne({ where: { id: stationId } });
            if (!station)
                throw new common_1.NotFoundException(`Station "${stationId}" was not found`);
            sensor.station = station;
        }
        const saved = await this.sensorRepository.save(sensor);
        await this.clearListCache();
        return saved;
    }
    async remove(id) {
        const sensor = await this.findOne(id);
        await this.sensorRepository.remove(sensor);
        await this.clearListCache();
        return { deleted: true, id };
    }
    async findData(sensorId, limit = 100) {
        await this.findOne(sensorId);
        return this.sensorDataRepository.find({
            where: { sensor: { id: sensorId } },
            order: { timestamp: 'DESC' },
            take: limit,
        });
    }
    async clearListCache() {
        for (const key of this.listCacheKeys) {
            await this.cacheManager.del(key);
        }
        this.listCacheKeys.clear();
    }
};
exports.SensorsService = SensorsService;
exports.SensorsService = SensorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Sensor_entity_1.Sensor)),
    __param(1, (0, typeorm_1.InjectRepository)(SensorData_entity_1.SensorData)),
    __param(2, (0, typeorm_1.InjectRepository)(Station_entity_1.Station)),
    __param(3, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], SensorsService);
//# sourceMappingURL=sensors.service.js.map