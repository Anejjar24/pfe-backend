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
exports.MaintenanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const User_entity_1 = require("../database/entities/User.entity");
const create_maintenance_dto_1 = require("./dto/create-maintenance.dto");
const maintenance_query_dto_1 = require("./dto/maintenance-query.dto");
const update_maintenance_dto_1 = require("./dto/update-maintenance.dto");
const maintenance_service_1 = require("./maintenance.service");
let MaintenanceController = class MaintenanceController {
    constructor(maintenanceService) {
        this.maintenanceService = maintenanceService;
    }
    findAll(query) {
        return this.maintenanceService.findAll(query);
    }
    findOne(id) {
        return this.maintenanceService.findOne(id);
    }
    create(dto, req) {
        return this.maintenanceService.create(dto, req.user);
    }
    update(id, dto) {
        return this.maintenanceService.update(id, dto);
    }
    async remove(id) {
        await this.maintenanceService.remove(id);
    }
};
exports.MaintenanceController = MaintenanceController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List work orders (paginated, filterable)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated maintenance list' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [maintenance_query_dto_1.MaintenanceQueryDto]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single work order' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Maintenance UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Maintenance object' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Work order not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(User_entity_1.UserRole.ADMIN, User_entity_1.UserRole.OPERATOR, User_entity_1.UserRole.TECHNICIAN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a work order (admin/operator/technician)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Work order created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_maintenance_dto_1.CreateMaintenanceDto, Object]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(User_entity_1.UserRole.ADMIN, User_entity_1.UserRole.OPERATOR, User_entity_1.UserRole.TECHNICIAN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a work order' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Maintenance UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Updated work order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_maintenance_dto_1.UpdateMaintenanceDto]),
    __metadata("design:returntype", void 0)
], MaintenanceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(User_entity_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a work order (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Maintenance UUID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MaintenanceController.prototype, "remove", null);
exports.MaintenanceController = MaintenanceController = __decorate([
    (0, swagger_1.ApiTags)('maintenance'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('maintenance'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [maintenance_service_1.MaintenanceService])
], MaintenanceController);
//# sourceMappingURL=maintenance.controller.js.map