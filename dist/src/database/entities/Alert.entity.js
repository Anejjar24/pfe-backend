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
exports.Alert = exports.AlertStatus = exports.AlertSeverity = exports.AlertType = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const Station_entity_1 = require("./Station.entity");
const Sensor_entity_1 = require("./Sensor.entity");
const Notification_entity_1 = require("./Notification.entity");
var AlertType;
(function (AlertType) {
    AlertType["THRESHOLD_VIOLATION"] = "threshold_violation";
    AlertType["SENSOR_OFFLINE"] = "sensor_offline";
    AlertType["MAINTENANCE_DUE"] = "maintenance_due";
    AlertType["SYSTEM_ERROR"] = "system_error";
    AlertType["ANOMALY"] = "anomaly";
    AlertType["CRITICAL_EVENT"] = "critical_event";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["INFO"] = "info";
    AlertSeverity["WARNING"] = "warning";
    AlertSeverity["ERROR"] = "error";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["ACTIVE"] = "active";
    AlertStatus["ACKNOWLEDGED"] = "acknowledged";
    AlertStatus["RESOLVED"] = "resolved";
    AlertStatus["SUPPRESSED"] = "suppressed";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
let Alert = class Alert {
    get duration() {
        if (this.acknowledgedAt) {
            return this.acknowledgedAt.getTime() - this.createdAt.getTime();
        }
        return Date.now() - this.createdAt.getTime();
    }
    get isActive() {
        return this.status === AlertStatus.ACTIVE;
    }
};
exports.Alert = Alert;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Alert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AlertType,
    }),
    __metadata("design:type", String)
], Alert.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AlertSeverity,
    }),
    __metadata("design:type", String)
], Alert.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AlertStatus,
        default: AlertStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Alert.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Alert.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Alert.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Alert.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Station_entity_1.Station, (station) => station.alerts, {
        onDelete: 'CASCADE',
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'station_id' }),
    __metadata("design:type", Station_entity_1.Station)
], Alert.prototype, "station", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sensor_entity_1.Sensor, (sensor) => sensor.alerts, {
        onDelete: 'CASCADE',
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'sensor_id' }),
    __metadata("design:type", Sensor_entity_1.Sensor)
], Alert.prototype, "sensor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Alert.prototype, "acknowledgedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'acknowledged_by' }),
    __metadata("design:type", User_entity_1.User)
], Alert.prototype, "acknowledgedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Alert.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'resolved_by' }),
    __metadata("design:type", User_entity_1.User)
], Alert.prototype, "resolvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Alert.prototype, "sourceSystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Alert.prototype, "isNotified", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Alert.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Alert.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Notification_entity_1.Notification, (notification) => notification.alert),
    __metadata("design:type", Array)
], Alert.prototype, "notifications", void 0);
exports.Alert = Alert = __decorate([
    (0, typeorm_1.Entity)('alerts')
], Alert);
//# sourceMappingURL=Alert.entity.js.map