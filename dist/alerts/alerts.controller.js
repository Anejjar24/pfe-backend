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
exports.AlertsController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const User_entity_1 = require("../database/entities/User.entity");
const alert_query_dto_1 = require("./dto/alert-query.dto");
const create_alert_dto_1 = require("./dto/create-alert.dto");
const alerts_service_1 = require("./alerts.service");
let AlertsController = class AlertsController {
    constructor(alertsService) {
        this.alertsService = alertsService;
    }
    findAll(query) {
        return this.alertsService.findAll(query);
    }
    findOne(id) {
        return this.alertsService.findOne(id);
    }
    create(dto) {
        return this.alertsService.create(dto);
    }
    acknowledge(id, req) {
        return this.alertsService.acknowledge(id, req.user);
    }
    resolve(id, req) {
        return this.alertsService.resolve(id, req.user);
    }
};
exports.AlertsController = AlertsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [alert_query_dto_1.AlertQueryDto]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(User_entity_1.UserRole.ADMIN, User_entity_1.UserRole.OPERATOR),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_alert_dto_1.CreateAlertDto]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/acknowledge'),
    (0, roles_decorator_1.Roles)(User_entity_1.UserRole.ADMIN, User_entity_1.UserRole.OPERATOR, User_entity_1.UserRole.TECHNICIAN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "acknowledge", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    (0, roles_decorator_1.Roles)(User_entity_1.UserRole.ADMIN, User_entity_1.UserRole.OPERATOR, User_entity_1.UserRole.TECHNICIAN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "resolve", null);
exports.AlertsController = AlertsController = __decorate([
    (0, common_1.Controller)('alerts'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [alerts_service_1.AlertsService])
], AlertsController);
//# sourceMappingURL=alerts.controller.js.map