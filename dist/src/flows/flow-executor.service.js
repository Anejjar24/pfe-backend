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
var FlowExecutorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowExecutorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const WorkflowExecution_entity_1 = require("../database/entities/WorkflowExecution.entity");
const Workflow_entity_1 = require("../database/entities/Workflow.entity");
const workflow_runner_1 = require("../execution/engine/workflow-runner");
const flow_validator_service_1 = require("./flow-validator.service");
let FlowExecutorService = FlowExecutorService_1 = class FlowExecutorService {
    constructor(validator, runner, executionRepo, workflowRepo) {
        this.validator = validator;
        this.runner = runner;
        this.executionRepo = executionRepo;
        this.workflowRepo = workflowRepo;
        this.logger = new common_1.Logger(FlowExecutorService_1.name);
    }
    async execute(graph, input = {}, options = {}) {
        this.validator.validate(graph);
        const workflow = options.workflowId
            ? await this.workflowRepo.findOne({ where: { id: options.workflowId } })
            : null;
        const execution = await this.executionRepo.save(this.executionRepo.create({
            workflow: workflow ?? undefined,
            status: WorkflowExecution_entity_1.WorkflowExecutionStatus.RUNNING,
            input,
            triggerSource: options.triggerSource ?? 'manual',
            triggeredBy: options.user ?? undefined,
            nodeExecutionCount: 0,
            successCount: 0,
            failureCount: 0,
        }));
        const startedAt = Date.now();
        let result;
        try {
            result = await this.runner.run(graph, input);
            const duration = Date.now() - startedAt;
            await this.executionRepo.save({
                ...execution,
                status: WorkflowExecution_entity_1.WorkflowExecutionStatus.COMPLETED,
                output: result.output,
                executionLog: result.steps,
                nodeExecutionCount: result.steps.length,
                successCount: result.steps.length,
                failureCount: 0,
                duration,
            });
            if (workflow) {
                await this.workflowRepo.update(workflow.id, {
                    executionCount: () => 'execution_count + 1',
                    lastExecutedAt: new Date(),
                });
            }
        }
        catch (err) {
            const duration = Date.now() - startedAt;
            const errorMessage = err instanceof Error ? err.message : String(err);
            const stackTrace = err instanceof Error ? err.stack : undefined;
            await this.executionRepo.save({
                ...execution,
                status: WorkflowExecution_entity_1.WorkflowExecutionStatus.FAILED,
                errorMessage,
                stackTrace,
                failureCount: 1,
                duration,
            });
            this.logger.error(`Workflow execution failed: ${errorMessage}`, stackTrace);
            throw err;
        }
        return result;
    }
};
exports.FlowExecutorService = FlowExecutorService;
exports.FlowExecutorService = FlowExecutorService = FlowExecutorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(WorkflowExecution_entity_1.WorkflowExecution)),
    __param(3, (0, typeorm_1.InjectRepository)(Workflow_entity_1.Workflow)),
    __metadata("design:paramtypes", [flow_validator_service_1.FlowValidatorService,
        workflow_runner_1.WorkflowRunner,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FlowExecutorService);
//# sourceMappingURL=flow-executor.service.js.map