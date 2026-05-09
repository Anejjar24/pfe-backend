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
exports.StationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Station_entity_1 = require("../database/entities/Station.entity");
let StationsService = class StationsService {
    constructor(stationRepository) {
        this.stationRepository = stationRepository;
    }
    async create(dto, user) {
        const station = this.stationRepository.create({
            ...dto,
            createdBy: user,
            ...(dto.status ? { lastStatusChange: new Date() } : {}),
        });
        return this.stationRepository.save(station);
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.type)
            where.type = query.type;
        if (query.search)
            where.name = (0, typeorm_2.ILike)(`%${query.search}%`);
        const [data, total] = await this.stationRepository.findAndCount({
            where,
            relations: ['createdBy', 'sensors', 'alerts'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const station = await this.stationRepository.findOne({
            where: { id },
            relations: ['createdBy', 'sensors', 'alerts', 'maintenances'],
        });
        if (!station) {
            throw new common_1.NotFoundException(`Station "${id}" was not found`);
        }
        return station;
    }
    async update(id, dto) {
        const station = await this.findOne(id);
        const statusChanged = dto.status && dto.status !== station.status;
        Object.assign(station, dto);
        if (statusChanged)
            station.lastStatusChange = new Date();
        return this.stationRepository.save(station);
    }
    async remove(id) {
        const station = await this.findOne(id);
        await this.stationRepository.remove(station);
        return { deleted: true, id };
    }
};
exports.StationsService = StationsService;
exports.StationsService = StationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Station_entity_1.Station)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StationsService);
//# sourceMappingURL=stations.service.js.map