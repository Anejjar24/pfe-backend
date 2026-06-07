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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const User_entity_1 = require("../database/entities/User.entity");
function stripPassword({ password: _pw, ...safe }) {
    return safe;
}
let UsersService = class UsersService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const qb = this.userRepo.createQueryBuilder('u').orderBy('u.lastname', 'ASC').addOrderBy('u.firstname', 'ASC');
        if (query.role) {
            qb.andWhere('u.role = :role', { role: query.role });
        }
        if (query.isActive !== undefined) {
            qb.andWhere('u.is_active = :isActive', { isActive: query.isActive });
        }
        if (query.search) {
            const term = `%${query.search}%`;
            qb.andWhere('(u.email ILIKE :term OR u.firstname ILIKE :term OR u.lastname ILIKE :term)', { term });
        }
        const [users, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            data: users.map(stripPassword),
            meta: { total, page, limit, pages: Math.ceil(total / limit) },
        };
    }
    async findForDropdown(role) {
        const where = { isActive: true };
        if (role && Object.values(User_entity_1.UserRole).includes(role)) {
            where.role = role;
        }
        const users = await this.userRepo.find({
            where,
            order: { lastname: 'ASC', firstname: 'ASC' },
        });
        return users.map(stripPassword);
    }
    async findOne(id) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        return stripPassword(user);
    }
    async update(id, dto) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        if (dto.role !== undefined)
            user.role = dto.role;
        if (dto.isActive !== undefined)
            user.isActive = dto.isActive;
        const saved = await this.userRepo.save(user);
        return stripPassword(saved);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(User_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map