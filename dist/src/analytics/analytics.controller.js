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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const analytics_service_1 = require("./analytics.service");
const analytics_query_dto_1 = require("./dto/analytics-query.dto");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getOverview() {
        return this.analyticsService.getOverview();
    }
    async getSensorStats(id, query) {
        const result = await this.analyticsService.getSensorStats(id, query);
        if (!result)
            throw new common_1.NotFoundException(`Sensor ${id} not found`);
        return result;
    }
    async getStationHistory(id, query) {
        const result = await this.analyticsService.getStationHistory(id, query);
        if (!result)
            throw new common_1.NotFoundException(`Station ${id} not found`);
        return result;
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'System-wide KPIs: station counts, active sensors, open alerts, pending maintenance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Overview object with counts and breakdowns' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('sensors/:id/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Per-sensor statistics: avg/min/max/stddev + hourly time-series' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sensor UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, description: 'Range start (ISO 8601). Default: 24 h ago' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, description: 'Range end (ISO 8601). Default: now' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sensor stats + time-series buckets' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sensor not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, analytics_query_dto_1.SensorStatsQueryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSensorStats", null);
__decorate([
    (0, common_1.Get)('stations/:id/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Station sensor history grouped by hour or day' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Station UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'granularity', required: false, enum: ['hour', 'day'], description: 'Bucket size (default: hour)' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false, description: 'Range start (ISO 8601)' }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false, description: 'Range end (ISO 8601)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Per-sensor bucketed readings for the station' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Station not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, analytics_query_dto_1.StationHistoryQueryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getStationHistory", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('analytics'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map