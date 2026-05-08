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
exports.FlowsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const flow_validator_service_1 = require("./flow-validator.service");
let FlowsService = class FlowsService {
    constructor(validator) {
        this.validator = validator;
        this.flows = new Map();
    }
    create(dto) {
        this.validator.validate(dto.graph);
        const now = new Date().toISOString();
        const id = dto.graph.id || (0, crypto_1.randomUUID)();
        const flow = {
            id,
            name: dto.name || dto.graph.name || 'Untitled workflow',
            graph: { ...dto.graph, id },
            createdAt: now,
            updatedAt: now,
        };
        this.flows.set(id, flow);
        return flow;
    }
    update(id, dto) {
        const current = this.findOne(id);
        this.validator.validate(dto.graph);
        const flow = {
            ...current,
            name: dto.name || current.name,
            graph: { ...dto.graph, id },
            updatedAt: new Date().toISOString(),
        };
        this.flows.set(id, flow);
        return flow;
    }
    findAll() {
        return Array.from(this.flows.values());
    }
    findOne(id) {
        const flow = this.flows.get(id);
        if (!flow)
            throw new common_1.NotFoundException(`Workflow "${id}" was not found.`);
        return flow;
    }
    remove(id) {
        this.findOne(id);
        this.flows.delete(id);
        return { deleted: true, id };
    }
};
exports.FlowsService = FlowsService;
exports.FlowsService = FlowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [flow_validator_service_1.FlowValidatorService])
], FlowsService);
//# sourceMappingURL=flows.service.js.map