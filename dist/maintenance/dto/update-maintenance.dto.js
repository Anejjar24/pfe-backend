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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMaintenanceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const create_maintenance_dto_1 = require("./create-maintenance.dto");
class UpdateMaintenanceDto extends (0, swagger_1.PartialType)(create_maintenance_dto_1.CreateMaintenanceDto) {
}
exports.UpdateMaintenanceDto = UpdateMaintenanceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Replaced seal and tested pump at 6 bar', description: 'Summary of work done' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMaintenanceDto.prototype, "workDone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 280.0, description: 'Actual cost incurred' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMaintenanceDto.prototype, "actualCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5.5, description: 'Actual duration in hours' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateMaintenanceDto.prototype, "actualDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-05-20T09:00:00Z', description: 'When work started (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateMaintenanceDto.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-05-20T14:30:00Z', description: 'When work completed (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateMaintenanceDto.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'UUID of the technician to reassign' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateMaintenanceDto.prototype, "assignedToId", void 0);
//# sourceMappingURL=update-maintenance.dto.js.map