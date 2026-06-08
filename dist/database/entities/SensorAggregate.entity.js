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
exports.SensorAggregate = void 0;
const typeorm_1 = require("typeorm");
let SensorAggregate = class SensorAggregate {
};
exports.SensorAggregate = SensorAggregate;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'sensor_id', type: 'uuid' }),
    __metadata("design:type", String)
], SensorAggregate.prototype, "sensorId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'bucket', type: 'timestamptz' }),
    __metadata("design:type", Date)
], SensorAggregate.prototype, "bucket", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'granularity', type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], SensorAggregate.prototype, "granularity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'station_id', type: 'uuid' }),
    __metadata("design:type", String)
], SensorAggregate.prototype, "stationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avg_value', type: 'double precision', nullable: true }),
    __metadata("design:type", Object)
], SensorAggregate.prototype, "avgValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_value', type: 'double precision', nullable: true }),
    __metadata("design:type", Object)
], SensorAggregate.prototype, "minValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_value', type: 'double precision', nullable: true }),
    __metadata("design:type", Object)
], SensorAggregate.prototype, "maxValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stddev_value', type: 'double precision', nullable: true }),
    __metadata("design:type", Object)
], SensorAggregate.prototype, "stddevValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reading_count', type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], SensorAggregate.prototype, "readingCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'anomaly_flag', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SensorAggregate.prototype, "anomalyFlag", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rolling_mean', type: 'double precision', nullable: true }),
    __metadata("design:type", Object)
], SensorAggregate.prototype, "rollingMean", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rolling_stddev', type: 'double precision', nullable: true }),
    __metadata("design:type", Object)
], SensorAggregate.prototype, "rollingStddev", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'computed_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], SensorAggregate.prototype, "computedAt", void 0);
exports.SensorAggregate = SensorAggregate = __decorate([
    (0, typeorm_1.Entity)('sensor_aggregates'),
    (0, typeorm_1.Index)(['stationId', 'bucket']),
    (0, typeorm_1.Index)(['sensorId', 'granularity', 'bucket'])
], SensorAggregate);
//# sourceMappingURL=SensorAggregate.entity.js.map