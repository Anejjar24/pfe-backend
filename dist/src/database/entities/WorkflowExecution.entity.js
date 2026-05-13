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
exports.WorkflowExecution = exports.WorkflowExecutionStatus = void 0;
const typeorm_1 = require("typeorm");
const Workflow_entity_1 = require("./Workflow.entity");
const User_entity_1 = require("./User.entity");
var WorkflowExecutionStatus;
(function (WorkflowExecutionStatus) {
    WorkflowExecutionStatus["RUNNING"] = "running";
    WorkflowExecutionStatus["COMPLETED"] = "completed";
    WorkflowExecutionStatus["FAILED"] = "failed";
    WorkflowExecutionStatus["CANCELLED"] = "cancelled";
    WorkflowExecutionStatus["PAUSED"] = "paused";
})(WorkflowExecutionStatus || (exports.WorkflowExecutionStatus = WorkflowExecutionStatus = {}));
let WorkflowExecution = class WorkflowExecution {
    get isRunning() {
        return this.status === WorkflowExecutionStatus.RUNNING;
    }
    get isSuccessful() {
        return this.status === WorkflowExecutionStatus.COMPLETED && !this.errorMessage;
    }
    get hasError() {
        return this.status === WorkflowExecutionStatus.FAILED || this.failureCount > 0;
    }
};
exports.WorkflowExecution = WorkflowExecution;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Workflow_entity_1.Workflow, (workflow) => workflow.executions, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'workflow_id' }),
    __metadata("design:type", Workflow_entity_1.Workflow)
], WorkflowExecution.prototype, "workflow", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: WorkflowExecutionStatus,
        default: WorkflowExecutionStatus.RUNNING,
    }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WorkflowExecution.prototype, "input", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WorkflowExecution.prototype, "output", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], WorkflowExecution.prototype, "executionLog", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'triggered_by' }),
    __metadata("design:type", User_entity_1.User)
], WorkflowExecution.prototype, "triggeredBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "triggerSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], WorkflowExecution.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WorkflowExecution.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WorkflowExecution.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WorkflowExecution.prototype, "nodeStates", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], WorkflowExecution.prototype, "nodeExecutionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], WorkflowExecution.prototype, "successCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], WorkflowExecution.prototype, "failureCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "currentNode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "stackTrace", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WorkflowExecution.prototype, "metadata", void 0);
exports.WorkflowExecution = WorkflowExecution = __decorate([
    (0, typeorm_1.Entity)('workflow_executions')
], WorkflowExecution);
//# sourceMappingURL=WorkflowExecution.entity.js.map