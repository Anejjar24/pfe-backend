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
exports.SensorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const User_entity_1 = require("../database/entities/User.entity");
const create_sensor_dto_1 = require("./dto/create-sensor.dto");
const sensor_query_dto_1 = require("./dto/sensor-query.dto");
const update_sensor_dto_1 = require("./dto/update-sensor.dto");
const sensors_service_1 = require("./sensors.service");
let SensorsController = class SensorsController {
    constructor(sensorsService) {
        this.sensorsService = sensorsService;
    }
    findAll(query) {
        return this.sensorsService.findAll(query);
    }
    findOne(id) {
        return this.sensorsService.findOne(id);
    }
    findData(id, limit) {
        return this.sensorsService.findData(id, Number(limit) || 100);
    }
    create(dto) {
        return this.sensorsService.create(dto);
    }
    update(id, dto) {
        return this.sensorsService.update(id, dto);
    }
    async remove(id) {
        await this.sensorsService.remove(id);
    }
};
exports.SensorsController = SensorsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List sensors (paginated, filterable)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated sensor list (cached 60 s)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sensor_query_dto_1.SensorQueryDto]),
    __metadata("design:returntype", void 0)
], SensorsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single sensor with station + recent alerts' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sensor UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sensor object' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sensor not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SensorsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/data'),
    (0, swagger_1.ApiOperation)({ summary: 'Get historical sensor readings' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sensor UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Max readings to return (default 100)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array of SensorData records (newest first)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], SensorsController.prototype, "findData", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(User_entity_1.UserRole.ADMIN, User_entity_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new sensor (admin/operator)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sensor created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sensor_dto_1.CreateSensorDto]),
    __metadata("design:returntype", void 0)
], SensorsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(User_entity_1.UserRole.ADMIN, User_entity_1.UserRole.OPERATOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update a sensor (admin/operator)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sensor UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Updated sensor' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_sensor_dto_1.UpdateSensorDto]),
    __metadata("design:returntype", void 0)
], SensorsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(User_entity_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a sensor (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sensor UUID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SensorsController.prototype, "remove", null);
exports.SensorsController = SensorsController = __decorate([
    (0, swagger_1.ApiTags)('sensors'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('sensors'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [sensors_service_1.SensorsService])
], SensorsController);
//# sourceMappingURL=sensors.controller.js.map