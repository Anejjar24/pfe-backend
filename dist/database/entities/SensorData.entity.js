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
exports.SensorData = void 0;
const typeorm_1 = require("typeorm");
const Sensor_entity_1 = require("./Sensor.entity");
let SensorData = class SensorData {
    setDefaults() {
        if (!this.id) {
            this.id = crypto.randomUUID
                ? crypto.randomUUID()
                : require('crypto').randomUUID();
        }
        if (!this.timestamp) {
            this.timestamp = new Date();
        }
    }
};
exports.SensorData = SensorData;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'uuid' }),
    __metadata("design:type", String)
], SensorData.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 15, scale: 4 }),
    __metadata("design:type", Number)
], SensorData.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], SensorData.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SensorData.prototype, "qualityFlags", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sensor_entity_1.Sensor, (sensor) => sensor.sensorData, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sensor_id' }),
    __metadata("design:type", Sensor_entity_1.Sensor)
], SensorData.prototype, "sensor", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SensorData.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], SensorData.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], SensorData.prototype, "accuracy", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SensorData.prototype, "setDefaults", null);
exports.SensorData = SensorData = __decorate([
    (0, typeorm_1.Entity)('sensor_data'),
    (0, typeorm_1.Index)(['sensor', 'timestamp'])
], SensorData);
//# sourceMappingURL=SensorData.entity.js.map