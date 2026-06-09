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
const kafka_consumer_service_1 = require("../iot/kafka/kafka.consumer.service");
const analytics_service_1 = require("./analytics.service");
const analytics_query_dto_1 = require("./dto/analytics-query.dto");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService, kafkaConsumer) {
        this.analyticsService = analyticsService;
        this.kafkaConsumer = kafkaConsumer;
    }
    getOverview() {
        return this.analyticsService.getOverview();
    }
    getStationStatus() {
        return this.analyticsService.getStationStatus();
    }
    async getAnomalyTimeline(hours, limit) {
        return this.analyticsService.getAnomalyTimeline(hours ?? 24, limit ?? 100);
    }
    async getNetworkTrend(hours) {
        return this.analyticsService.getNetworkTrend(hours ?? 6);
    }
    getDataFreshness() {
        const stats = this.kafkaConsumer.getPipelineStats();
        return {
            lastReadingAt: stats.lastReadingAt ?? null,
            lastAnomalyAt: stats.lastAnomalyAt ?? null,
            totalMeasurements: stats.readingsConsumed ?? 0,
            totalAnomalies: stats.anomaliesConsumed ?? 0,
            monitoringActive: this.kafkaConsumer.getIsRunning(),
        };
    }
    getPipelineStats() {
        return {
            ...this.kafkaConsumer.getPipelineStats(),
            consumerRunning: this.kafkaConsumer.getIsRunning(),
        };
    }
    async getKpis(granularity, hours) {
        return this.analyticsService.getKpis(granularity ?? 'hourly', hours ?? 24);
    }
    async getSystemMetrics(hours) {
        return this.analyticsService.getSystemMetrics(hours ?? 24);
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
    (0, swagger_1.ApiOperation)({ summary: 'System-wide counts: stations, sensors, alerts, maintenance' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('station-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Per-station health: sensor counts by status, open alerts, last reading' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getStationStatus", null);
__decorate([
    (0, common_1.Get)('anomaly-timeline'),
    (0, swagger_1.ApiOperation)({ summary: 'Recent anomaly and threshold-violation alerts with station/sensor context' }),
    (0, swagger_1.ApiQuery)({ name: 'hours', required: false, description: 'Look-back window in hours (default: 24)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Max events returned (default: 100)' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Query)('hours', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getAnomalyTimeline", null);
__decorate([
    (0, common_1.Get)('network-trend'),
    (0, swagger_1.ApiOperation)({ summary: 'Hourly-bucketed average reading across all sensors for the last N hours' }),
    (0, swagger_1.ApiQuery)({ name: 'hours', required: false, description: 'Look-back window (default: 6)' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Query)('hours', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getNetworkTrend", null);
__decorate([
    (0, common_1.Get)('data-freshness'),
    (0, swagger_1.ApiOperation)({ summary: 'Monitoring pipeline status: last reading timestamp, consumer health' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getDataFreshness", null);
__decorate([
    (0, common_1.Get)('pipeline/stats'),
    (0, swagger_1.ApiOperation)({ summary: '[Internal] Raw Kafka consumer stats' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getPipelineStats", null);
__decorate([
    (0, common_1.Get)('kpis'),
    (0, swagger_1.ApiOperation)({ summary: 'Pre-computed sensor KPIs from the aggregation engine (sensor_aggregates)' }),
    (0, swagger_1.ApiQuery)({ name: 'granularity', required: false, enum: ['hourly', 'daily'] }),
    (0, swagger_1.ApiQuery)({ name: 'hours', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Query)('granularity')),
    __param(1, (0, common_1.Query)('hours', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getKpis", null);
__decorate([
    (0, common_1.Get)('system-metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Measurement volume and top-sensor throughput for the look-back window' }),
    (0, swagger_1.ApiQuery)({ name: 'hours', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    __param(0, (0, common_1.Query)('hours', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSystemMetrics", null);
__decorate([
    (0, common_1.Get)('sensors/:id/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Aggregated statistics + time-series for one sensor' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sensor UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'granularity', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sensor not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, analytics_query_dto_1.SensorStatsQueryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSensorStats", null);
__decorate([
    (0, common_1.Get)('stations/:id/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Per-sensor bucketed readings for an entire station' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Station UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200 }),
    (0, swagger_1.ApiResponse)({ status: 404 }),
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
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        kafka_consumer_service_1.KafkaConsumerService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map