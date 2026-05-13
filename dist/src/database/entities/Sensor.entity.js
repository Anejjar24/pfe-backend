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
exports.Sensor = exports.SensorStatus = exports.SensorType = void 0;
const typeorm_1 = require("typeorm");
const Alert_entity_1 = require("./Alert.entity");
const SensorData_entity_1 = require("./SensorData.entity");
const Station_entity_1 = require("./Station.entity");
var SensorType;
(function (SensorType) {
    SensorType["PRESSURE"] = "pressure";
    SensorType["FLOW"] = "flow";
    SensorType["TEMPERATURE"] = "temperature";
    SensorType["QUALITY"] = "quality";
    SensorType["LEVEL"] = "level";
    SensorType["PH"] = "ph";
    SensorType["TURBIDITY"] = "turbidity";
    SensorType["CHLORINE"] = "chlorine";
})(SensorType || (exports.SensorType = SensorType = {}));
var SensorStatus;
(function (SensorStatus) {
    SensorStatus["ACTIVE"] = "active";
    SensorStatus["INACTIVE"] = "inactive";
    SensorStatus["FAULTY"] = "faulty";
    SensorStatus["OFFLINE"] = "offline";
})(SensorStatus || (exports.SensorStatus = SensorStatus = {}));
let Sensor = class Sensor {
    get isHealthy() {
        return this.status === SensorStatus.ACTIVE && this.lastReading !== null;
    }
    get isThresholdViolated() {
        if (!this.lastReading)
            return false;
        if (this.minThreshold && this.lastReading < this.minThreshold)
            return true;
        if (this.maxThreshold && this.lastReading > this.maxThreshold)
            return true;
        return false;
    }
};
exports.Sensor = Sensor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Sensor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Sensor.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SensorType,
    }),
    __metadata("design:type", String)
], Sensor.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Sensor.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Sensor.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Sensor.prototype, "minThreshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Sensor.prototype, "maxThreshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Sensor.prototype, "lastReading", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Sensor.prototype, "lastReadingAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SensorStatus,
        default: SensorStatus.INACTIVE,
    }),
    __metadata("design:type", String)
], Sensor.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Sensor.prototype, "alertEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Sensor.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Station_entity_1.Station, (station) => station.sensors),
    (0, typeorm_1.JoinColumn)({ name: 'station_id' }),
    __metadata("design:type", Station_entity_1.Station)
], Sensor.prototype, "station", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SensorData_entity_1.SensorData, (data) => data.sensor),
    __metadata("design:type", Array)
], Sensor.prototype, "sensorData", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Alert_entity_1.Alert, (alert) => alert.sensor),
    __metadata("design:type", Array)
], Sensor.prototype, "alerts", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Sensor.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Sensor.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Sensor.prototype, "deviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Sensor.prototype, "serialNumber", void 0);
exports.Sensor = Sensor = __decorate([
    (0, typeorm_1.Entity)('sensors')
], Sensor);
//# sourceMappingURL=Sensor.entity.js.map