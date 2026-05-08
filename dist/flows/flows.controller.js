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
const create_flow_dto_1 = require("./dto/create-flow.dto");
const execute_flow_dto_1 = require("./dto/execute-flow.dto");
const flow_executor_service_1 = require("./flow-executor.service");
const flows_service_1 = require("./flows.service");
let FlowsController = class FlowsController {
    constructor(flowsService, executorService) {
        this.flowsService = flowsService;
        this.executorService = executorService;
    }
    create(dto) {
        return this.flowsService.create(dto);
    }
    findAll() {
        return this.flowsService.findAll();
    }
    findOne(id) {
        return this.flowsService.findOne(id);
    }
    update(id, dto) {
        return this.flowsService.update(id, dto);
    }
    remove(id) {
        return this.flowsService.remove(id);
    }
    execute(dto) {
        return this.executorService.execute(dto.graph, dto.input);
    }
};
exports.FlowsController = FlowsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_flow_dto_1.CreateFlowDto]),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_flow_dto_1.CreateFlowDto]),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('execute'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [execute_flow_dto_1.ExecuteFlowDto]),
    __metadata("design:returntype", void 0)
], FlowsController.prototype, "execute", null);
exports.FlowsController = FlowsController = __decorate([
    (0, common_1.Controller)('flows'),
    __metadata("design:paramtypes", [flows_service_1.FlowsService,
        flow_executor_service_1.FlowExecutorService])
], FlowsController);
//# sourceMappingURL=flows.controller.js.map