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
exports.CreateSensorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const Sensor_entity_1 = require("../../database/entities/Sensor.entity");
class CreateSensorDto {
}
exports.CreateSensorDto = CreateSensorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pressure-01', description: 'Sensor name', maxLength: 255 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateSensorDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: Sensor_entity_1.SensorType, description: 'Sensor measurement type' }),
    (0, class_validator_1.IsEnum)(Sensor_entity_1.SensorType),
    __metadata("design:type", String)
], CreateSensorDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'bar', description: 'Measurement unit', maxLength: 50 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateSensorDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6', description: 'ID of the parent station' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSensorDto.prototype, "stationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Pump room A', description: 'Physical location within station' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSensorDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0.5, description: 'Minimum threshold — alert below this value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSensorDto.prototype, "minThreshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 8.0, description: 'Maximum threshold — alert above this value' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSensorDto.prototype, "maxThreshold", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: Sensor_entity_1.SensorStatus, description: 'Operational status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Sensor_entity_1.SensorStatus),
    __metadata("design:type", String)
], CreateSensorDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Enable automatic threshold alerts' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSensorDto.prototype, "alertEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'dev-abc123', description: 'MQTT device identifier' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSensorDto.prototype, "deviceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SN-20240101', description: 'Hardware serial number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSensorDto.prototype, "serialNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Object, description: 'Arbitrary metadata JSON' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSensorDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-sensor.dto.js.map