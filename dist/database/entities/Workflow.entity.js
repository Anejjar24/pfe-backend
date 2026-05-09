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
exports.Workflow = exports.WorkflowTriggerType = exports.WorkflowStatus = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("./User.entity");
const WorkflowExecution_entity_1 = require("./WorkflowExecution.entity");
var WorkflowStatus;
(function (WorkflowStatus) {
    WorkflowStatus["DRAFT"] = "draft";
    WorkflowStatus["ACTIVE"] = "active";
    WorkflowStatus["INACTIVE"] = "inactive";
    WorkflowStatus["ARCHIVED"] = "archived";
})(WorkflowStatus || (exports.WorkflowStatus = WorkflowStatus = {}));
var WorkflowTriggerType;
(function (WorkflowTriggerType) {
    WorkflowTriggerType["MANUAL"] = "manual";
    WorkflowTriggerType["SCHEDULED"] = "scheduled";
    WorkflowTriggerType["SENSOR_THRESHOLD"] = "sensor_threshold";
    WorkflowTriggerType["ALERT"] = "alert";
    WorkflowTriggerType["TIME_BASED"] = "time_based";
    WorkflowTriggerType["EXTERNAL"] = "external";
})(WorkflowTriggerType || (exports.WorkflowTriggerType = WorkflowTriggerType = {}));
let Workflow = class Workflow {
    get isValid() {
        return this.graph && Object.keys(this.graph).length > 0;
    }
};
exports.Workflow = Workflow;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Workflow.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Workflow.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Workflow.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: WorkflowStatus,
        default: WorkflowStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Workflow.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: WorkflowTriggerType,
        default: WorkflowTriggerType.MANUAL,
    }),
    __metadata("design:type", String)
], Workflow.prototype, "triggerType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], Workflow.prototype, "graph", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Workflow.prototype, "triggerConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Workflow.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Workflow.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Workflow.prototype, "isPublished", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], Workflow.prototype, "executionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Workflow.prototype, "lastExecutedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, (user) => user.createdWorkflows, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", User_entity_1.User)
], Workflow.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'updated_by' }),
    __metadata("design:type", User_entity_1.User)
], Workflow.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Workflow.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Workflow.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Workflow.prototype, "errorLog", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Workflow.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => WorkflowExecution_entity_1.WorkflowExecution, (execution) => execution.workflow),
    __metadata("design:type", Array)
], Workflow.prototype, "executions", void 0);
exports.Workflow = Workflow = __decorate([
    (0, typeorm_1.Entity)('workflows')
], Workflow);
//# sourceMappingURL=Workflow.entity.js.map