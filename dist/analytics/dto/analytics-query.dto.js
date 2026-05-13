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
exports.StationHistoryQueryDto = exports.SensorStatsQueryDto = exports.HistoryGranularity = void 0;
const class_validator_1 = require("class-validator");
var HistoryGranularity;
(function (HistoryGranularity) {
    HistoryGranularity["HOUR"] = "hour";
    HistoryGranularity["DAY"] = "day";
})(HistoryGranularity || (exports.HistoryGranularity = HistoryGranularity = {}));
class SensorStatsQueryDto {
}
exports.SensorStatsQueryDto = SensorStatsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SensorStatsQueryDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SensorStatsQueryDto.prototype, "to", void 0);
class StationHistoryQueryDto {
    constructor() {
        this.granularity = HistoryGranularity.HOUR;
    }
}
exports.StationHistoryQueryDto = StationHistoryQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(HistoryGranularity),
    __metadata("design:type", String)
], StationHistoryQueryDto.prototype, "granularity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StationHistoryQueryDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], StationHistoryQueryDto.prototype, "to", void 0);
//# sourceMappingURL=analytics-query.dto.js.map