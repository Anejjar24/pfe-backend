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
exports.Station = exports.StationType = exports.StationStatus = void 0;
const typeorm_1 = require("typeorm");
const Alert_entity_1 = require("./Alert.entity");
const Maintenance_entity_1 = require("./Maintenance.entity");
const Sensor_entity_1 = require("./Sensor.entity");
const User_entity_1 = require("./User.entity");
var StationStatus;
(function (StationStatus) {
    StationStatus["NORMAL"] = "normal";
    StationStatus["WARNING"] = "warning";
    StationStatus["CRITICAL"] = "critical";
    StationStatus["OFFLINE"] = "offline";
})(StationStatus || (exports.StationStatus = StationStatus = {}));
var StationType;
(function (StationType) {
    StationType["TREATMENT"] = "treatment";
    StationType["DISTRIBUTION"] = "distribution";
    StationType["STORAGE"] = "storage";
    StationType["MONITORING"] = "monitoring";
})(StationType || (exports.StationType = StationType = {}));
let Station = class Station {
    get statusColor() {
        const colors = {
            [StationStatus.NORMAL]: '#10b981',
            [StationStatus.WARNING]: '#f59e0b',
            [StationStatus.CRITICAL]: '#ef4444',
            [StationStatus.OFFLINE]: '#6b7280',
        };
        return colors[this.status];
    }
};
exports.Station = Station;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Station.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Station.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Station.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6 }),
    __metadata("design:type", Number)
], Station.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6 }),
    __metadata("design:type", Number)
], Station.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Station.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'liters' }),
    __metadata("design:type", String)
], Station.prototype, "capacityUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: StationType,
        default: StationType.TREATMENT,
    }),
    __metadata("design:type", String)
], Station.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: StationStatus,
        default: StationStatus.OFFLINE,
    }),
    __metadata("design:type", String)
], Station.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Station.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Station.prototype, "equipments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Station.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", User_entity_1.User)
], Station.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Sensor_entity_1.Sensor, (sensor) => sensor.station),
    __metadata("design:type", Array)
], Station.prototype, "sensors", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Alert_entity_1.Alert, (alert) => alert.station),
    __metadata("design:type", Array)
], Station.prototype, "alerts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Maintenance_entity_1.Maintenance, (maintenance) => maintenance.station),
    __metadata("design:type", Array)
], Station.prototype, "maintenances", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Station.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Station.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Station.prototype, "lastStatusChange", void 0);
exports.Station = Station = __decorate([
    (0, typeorm_1.Entity)('stations')
], Station);
//# sourceMappingURL=Station.entity.js.map