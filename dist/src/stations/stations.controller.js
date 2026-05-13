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
exports.StationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const User_entity_1 = require("../database/entities/User.entity");
const create_station_dto_1 = require("./dto/create-station.dto");
const station_query_dto_1 = require("./dto/station-query.dto");
const update_station_dto_1 = require("./dto/update-station.dto");
const stations_service_1 = require("./stations.service");
let StationsController = class StationsController {
    constructor(stationsService) {
        this.stationsService = stationsService;
    }
    findAll(query) {
        return this.stationsService.findAll(query);
    }
    findOne(id) {
        return this.stationsService.findOne(id);
    }
    create(dto, req) {
        return this.stationsService.create(dto, req.user);
    }
    update(id, dto) {
        return this.stationsService.update(id, dto);
    }
    async remove(id) {
        await this.stationsService.remove(id);
    }
};
exports.StationsController = StationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List stations (paginated, filterable)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated station list' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [station_query_dto_1.StationQueryDto]),
    __metadata("design:returntype", void 0)
], StationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single station with its sensors' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Station UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Station object' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Station not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(User_entity_1.UserRole.ADMIN, User_entity_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new station (admin/operator)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Station created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_station_dto_1.CreateStationDto, Object]),
    __metadata("design:returntype", void 0)
], StationsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(User_entity_1.UserRole.ADMIN, User_entity_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update a station (admin/operator)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Station UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Updated station' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_station_dto_1.UpdateStationDto]),
    __metadata("design:returntype", void 0)
], StationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(User_entity_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a station (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Station UUID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StationsController.prototype, "remove", null);
exports.StationsController = StationsController = __decorate([
    (0, swagger_1.ApiTags)('stations'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('stations'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [stations_service_1.StationsService])
], StationsController);
//# sourceMappingURL=stations.controller.js.map