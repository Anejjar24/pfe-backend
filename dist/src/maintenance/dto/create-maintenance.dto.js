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
exports.CreateMaintenanceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const Maintenance_entity_1 = require("../../database/entities/Maintenance.entity");
class CreateMaintenanceDto {
}
exports.CreateMaintenanceDto = CreateMaintenanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Replace pump seal', description: 'Work order title', maxLength: 255 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: Maintenance_entity_1.MaintenanceType, description: 'Type of maintenance work' }),
    (0, class_validator_1.IsEnum)(Maintenance_entity_1.MaintenanceType),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: Maintenance_entity_1.MaintenanceStatus, description: 'Initial status (default: scheduled)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Maintenance_entity_1.MaintenanceStatus),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: Maintenance_entity_1.MaintenancePriority, description: 'Priority level (default: medium)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Maintenance_entity_1.MaintenancePriority),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Seal on pump #3 is leaking, requires immediate replacement' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'UUID of the station this work order belongs to' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "stationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'UUID of the technician to assign' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "assignedToId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Pump-03', description: 'Equipment identifier or name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "equipment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SEAL-40MM-VITON', description: 'Spare part number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "partNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 250.0, description: 'Estimated cost in local currency' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMaintenanceDto.prototype, "estimatedCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4.5, description: 'Estimated duration in hours' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMaintenanceDto.prototype, "estimatedDuration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-05-20T08:00:00Z', description: 'Scheduled date/time (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "scheduledDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Requires station shutdown for 2 hours' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Object, description: 'Arbitrary metadata JSON' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateMaintenanceDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-maintenance.dto.js.map