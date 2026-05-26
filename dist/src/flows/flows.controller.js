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
exports.FlowsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const create_flow_dto_1 = require("./dto/create-flow.dto");
const execute_flow_dto_1 = require("./dto/execute-flow.dto");
const flow_executor_service_1 = require("./flow-executor.service");
const flows_service_1 = require("./flows.service");
const workflow_scheduler_service_1 = require("./workflow-scheduler.service");
let FlowsController = class FlowsController {
    constructor(flowsService, executorService, schedulerService) {
        this.flowsService = flowsService;
        this.executorService = executorService;
        this.schedulerService = schedulerService;
    }
    create(dto, req) {
        return this.flowsService.create(dto, req.user);
    }
    findAll() {
        return this.flowsService.findAll();
    }
    findOne(id) {
        return this.flowsService.findOne(id);
    }
    update(id, dto, req) {
        return this.flowsService.update(id, dto, req.user);
    }
    remove(id) {
        return this.flowsService.remove(id);
    }
    async activate(id) {
        const workflow = await this.flowsService.activate(id);
        await this.schedulerService.reloadWorkflow(id);
        return workflow;
    }
    async deactivate(id) {
        const workflow = await this.flowsService.deactivate(id);
        await this.schedulerService.reloadWorkflow(id);
        return workflow;
    }
    execute(dto, req) {
        return this.executorService.execute(dto.graph, dto.input ?? {}, {
            workflowId: dto.graph.id,
            user: req.user,
            triggerSource: 'manual',
        });
    }
};
exports.FlowsController = FlowsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new workflow' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Workflow created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_flow_dto_1.CreateFlowDto, Object]),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all workflows' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Array of workflow records' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single workflow' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Workflow UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Workflow object' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Workflow not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Replace a workflow graph' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Workflow UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Updated workflow' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_flow_dto_1.CreateFlowDto, Object]),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a workflow' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Workflow UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate a workflow — enables scheduled/MQTT triggers' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Workflow UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Workflow activated' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate a workflow — disables all triggers' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Workflow UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Workflow deactivated' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlowsController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)('execute'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute a workflow graph directly (ad-hoc run)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Execution result with per-node outputs' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [execute_flow_dto_1.ExecuteFlowDto, Object]),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "execute", null);
exports.FlowsController = FlowsController = __decorate([
    (0, swagger_1.ApiTags)('flows'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Controller)('flows'),
    __metadata("design:paramtypes", [flows_service_1.FlowsService,
        flow_executor_service_1.FlowExecutorService,
        workflow_scheduler_service_1.WorkflowSchedulerService])
], FlowsController);
//# sourceMappingURL=flows.controller.js.map