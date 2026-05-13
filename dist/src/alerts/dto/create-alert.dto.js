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
exports.CreateAlertDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const Alert_entity_1 = require("../../database/entities/Alert.entity");
class CreateAlertDto {
}
exports.CreateAlertDto = CreateAlertDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: Alert_entity_1.AlertType, description: 'Alert type / trigger category' }),
    (0, class_validator_1.IsEnum)(Alert_entity_1.AlertType),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: Alert_entity_1.AlertSeverity, description: 'Alert severity level' }),
    (0, class_validator_1.IsEnum)(Alert_entity_1.AlertSeverity),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pressure exceeded 8 bar on Sensor-01', description: 'Short alert message' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Sustained over-pressure for 5 minutes', description: 'Detailed description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'UUID of the related station' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "stationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'UUID of the related sensor' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "sensorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'iot-service', description: 'Source system identifier' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAlertDto.prototype, "sourceSystem", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Object, description: 'Additional structured data (readings, thresholds, etc.)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateAlertDto.prototype, "data", void 0);
//# sourceMappingURL=create-alert.dto.js.map