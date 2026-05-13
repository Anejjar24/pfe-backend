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
exports.Maintenance = exports.MaintenancePriority = exports.MaintenanceStatus = exports.MaintenanceType = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const Station_entity_1 = require("./Station.entity");
var MaintenanceType;
(function (MaintenanceType) {
    MaintenanceType["PREVENTIVE"] = "preventive";
    MaintenanceType["CORRECTIVE"] = "corrective";
    MaintenanceType["INSPECTION"] = "inspection";
    MaintenanceType["REPAIR"] = "repair";
    MaintenanceType["REPLACEMENT"] = "replacement";
    MaintenanceType["CALIBRATION"] = "calibration";
})(MaintenanceType || (exports.MaintenanceType = MaintenanceType = {}));
var MaintenanceStatus;
(function (MaintenanceStatus) {
    MaintenanceStatus["SCHEDULED"] = "scheduled";
    MaintenanceStatus["IN_PROGRESS"] = "in_progress";
    MaintenanceStatus["COMPLETED"] = "completed";
    MaintenanceStatus["CANCELLED"] = "cancelled";
    MaintenanceStatus["ON_HOLD"] = "on_hold";
})(MaintenanceStatus || (exports.MaintenanceStatus = MaintenanceStatus = {}));
var MaintenancePriority;
(function (MaintenancePriority) {
    MaintenancePriority["LOW"] = "low";
    MaintenancePriority["MEDIUM"] = "medium";
    MaintenancePriority["HIGH"] = "high";
    MaintenancePriority["CRITICAL"] = "critical";
})(MaintenancePriority || (exports.MaintenancePriority = MaintenancePriority = {}));
let Maintenance = class Maintenance {
    get isOverdue() {
        if (this.scheduledDate && this.status !== MaintenanceStatus.COMPLETED) {
            return new Date() > this.scheduledDate;
        }
        return false;
    }
    get duration() {
        if (this.startedAt && this.completedAt) {
            return this.completedAt.getTime() - this.startedAt.getTime();
        }
        return null;
    }
};
exports.Maintenance = Maintenance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Maintenance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Maintenance.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MaintenanceType,
    }),
    __metadata("design:type", String)
], Maintenance.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MaintenanceStatus,
        default: MaintenanceStatus.SCHEDULED,
    }),
    __metadata("design:type", String)
], Maintenance.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MaintenancePriority,
        default: MaintenancePriority.MEDIUM,
    }),
    __metadata("design:type", String)
], Maintenance.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Maintenance.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Maintenance.prototype, "workDone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Maintenance.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Station_entity_1.Station, (station) => station.maintenances, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'station_id' }),
    __metadata("design:type", Station_entity_1.Station)
], Maintenance.prototype, "station", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Maintenance.prototype, "equipment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Maintenance.prototype, "partNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Maintenance.prototype, "estimatedCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Maintenance.prototype, "actualCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Maintenance.prototype, "estimatedDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Maintenance.prototype, "actualDuration", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.createdMaintenances, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", User_entity_1.User)
], Maintenance.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.assignedMaintenances, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_to' }),
    __metadata("design:type", User_entity_1.User)
], Maintenance.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Maintenance.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Maintenance.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Maintenance.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Maintenance.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Maintenance.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Maintenance.prototype, "attachmentUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Maintenance.prototype, "metadata", void 0);
exports.Maintenance = Maintenance = __decorate([
    (0, typeorm_1.Entity)('maintenances')
], Maintenance);
//# sourceMappingURL=Maintenance.entity.js.map