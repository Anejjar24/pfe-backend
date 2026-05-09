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
exports.MaintenanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Maintenance_entity_1 = require("../database/entities/Maintenance.entity");
const Station_entity_1 = require("../database/entities/Station.entity");
const User_entity_1 = require("../database/entities/User.entity");
let MaintenanceService = class MaintenanceService {
    constructor(maintenanceRepository, stationRepository, userRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.stationRepository = stationRepository;
        this.userRepository = userRepository;
    }
    async create(dto, user) {
        const station = await this.stationRepository.findOne({ where: { id: dto.stationId } });
        if (!station)
            throw new common_1.NotFoundException(`Station "${dto.stationId}" was not found`);
        const assignedTo = dto.assignedToId
            ? await this.userRepository.findOne({ where: { id: dto.assignedToId } })
            : null;
        if (dto.assignedToId && !assignedTo)
            throw new common_1.NotFoundException(`User "${dto.assignedToId}" was not found`);
        const maintenance = this.maintenanceRepository.create({
            title: dto.title,
            type: dto.type,
            status: dto.status,
            priority: dto.priority,
            description: dto.description,
            station,
            createdBy: user,
            assignedTo: assignedTo || undefined,
            equipment: dto.equipment,
            partNumber: dto.partNumber,
            estimatedCost: dto.estimatedCost,
            estimatedDuration: dto.estimatedDuration,
            scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
            notes: dto.notes,
            metadata: dto.metadata,
        });
        return this.maintenanceRepository.save(maintenance);
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where = {};
        if (query.stationId)
            where.station = { id: query.stationId };
        if (query.status)
            where.status = query.status;
        if (query.type)
            where.type = query.type;
        if (query.priority)
            where.priority = query.priority;
        const [data, total] = await this.maintenanceRepository.findAndCount({
            where,
            relations: ['station', 'createdBy', 'assignedTo'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
    }
    async findOne(id) {
        const maintenance = await this.maintenanceRepository.findOne({
            where: { id },
            relations: ['station', 'createdBy', 'assignedTo'],
        });
        if (!maintenance)
            throw new common_1.NotFoundException(`Maintenance "${id}" was not found`);
        return maintenance;
    }
    async update(id, dto) {
        const maintenance = await this.findOne(id);
        const { stationId, assignedToId, scheduledDate, startedAt, completedAt, ...payload } = dto;
        Object.assign(maintenance, payload);
        if (stationId) {
            const station = await this.stationRepository.findOne({ where: { id: stationId } });
            if (!station)
                throw new common_1.NotFoundException(`Station "${stationId}" was not found`);
            maintenance.station = station;
        }
        if (assignedToId) {
            const assignedTo = await this.userRepository.findOne({ where: { id: assignedToId } });
            if (!assignedTo)
                throw new common_1.NotFoundException(`User "${assignedToId}" was not found`);
            maintenance.assignedTo = assignedTo;
        }
        if (scheduledDate)
            maintenance.scheduledDate = new Date(scheduledDate);
        if (startedAt)
            maintenance.startedAt = new Date(startedAt);
        if (completedAt)
            maintenance.completedAt = new Date(completedAt);
        return this.maintenanceRepository.save(maintenance);
    }
    async remove(id) {
        const maintenance = await this.findOne(id);
        await this.maintenanceRepository.remove(maintenance);
        return { deleted: true, id };
    }
};
exports.MaintenanceService = MaintenanceService;
exports.MaintenanceService = MaintenanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Maintenance_entity_1.Maintenance)),
    __param(1, (0, typeorm_1.InjectRepository)(Station_entity_1.Station)),
    __param(2, (0, typeorm_1.InjectRepository)(User_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MaintenanceService);
//# sourceMappingURL=maintenance.service.js.map