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
exports.StationHistoryQueryDto = exports.SensorStatsQueryDto = exports.GRANULARITY_INTERVAL = exports.HistoryGranularity = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var HistoryGranularity;
(function (HistoryGranularity) {
    HistoryGranularity["MIN5"] = "5min";
    HistoryGranularity["MIN15"] = "15min";
    HistoryGranularity["MIN30"] = "30min";
    HistoryGranularity["HOUR"] = "hour";
    HistoryGranularity["DAY"] = "day";
})(HistoryGranularity || (exports.HistoryGranularity = HistoryGranularity = {}));
exports.GRANULARITY_INTERVAL = {
    [HistoryGranularity.MIN5]: '5 minutes',
    [HistoryGranularity.MIN15]: '15 minutes',
    [HistoryGranularity.MIN30]: '30 minutes',
    [HistoryGranularity.HOUR]: '1 hour',
    [HistoryGranularity.DAY]: '1 day',
};
class SensorStatsQueryDto {
    constructor() {
        this.granularity = HistoryGranularity.HOUR;
    }
}
exports.SensorStatsQueryDto = SensorStatsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-05-06T00:00:00Z',
        description: 'Range start (ISO 8601). Default: 24 h ago',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SensorStatsQueryDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-05-13T00:00:00Z',
        description: 'Range end (ISO 8601). Default: now',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SensorStatsQueryDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: HistoryGranularity,
        default: HistoryGranularity.HOUR,
        description: 'Bucket size for the time-series (default: 1 hour)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(HistoryGranularity),
    __metadata("design:type", String)
], SensorStatsQueryDto.prototype, "granularity", void 0);
class StationHistoryQueryDto {
    constructor() {
        this.granularity = HistoryGranularity.HOUR;
    }
}
exports.StationHistoryQueryDto = StationHistoryQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: HistoryGranularity,
        default: HistoryGranularity.HOUR,
        description: 'Bucket size for aggregation',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(HistoryGranularity),
    __metadata("design:type", String)
], StationHistoryQueryDto.prototype, "granularity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-05-06T00:00:00Z',
        description: 'Range start (ISO 8601)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StationHistoryQueryDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '2026-05-13T00:00:00Z',
        description: 'Range end (ISO 8601)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StationHistoryQueryDto.prototype, "to", void 0);
//# sourceMappingURL=analytics-query.dto.js.map