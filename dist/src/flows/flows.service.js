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
exports.FlowsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const Workflow_entity_1 = require("../database/entities/Workflow.entity");
const flow_validator_service_1 = require("./flow-validator.service");
let FlowsService = class FlowsService {
    constructor(workflowRepository, validator) {
        this.workflowRepository = workflowRepository;
        this.validator = validator;
    }
    async create(dto, user) {
        this.validator.validate(dto.graph);
        const id = dto.graph.id || (0, crypto_1.randomUUID)();
        const workflow = this.workflowRepository.create({
            id,
            name: dto.name || dto.graph.name || 'Untitled workflow',
            graph: { ...dto.graph, id },
            createdBy: user,
        });
        return this.workflowRepository.save(workflow);
    }
    async findAll() {
        return this.workflowRepository.find({
            relations: ['createdBy'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const workflow = await this.workflowRepository.findOne({
            where: { id },
            relations: ['createdBy'],
        });
        if (!workflow)
            throw new common_1.NotFoundException(`Workflow "${id}" was not found.`);
        return workflow;
    }
    async update(id, dto, user) {
        const workflow = await this.findOne(id);
        this.validator.validate(dto.graph);
        workflow.name = dto.name || workflow.name;
        workflow.graph = { ...dto.graph, id };
        if (user)
            workflow.updatedBy = user;
        return this.workflowRepository.save(workflow);
    }
    async remove(id) {
        const workflow = await this.findOne(id);
        await this.workflowRepository.remove(workflow);
        return { deleted: true, id };
    }
};
exports.FlowsService = FlowsService;
exports.FlowsService = FlowsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Workflow_entity_1.Workflow)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        flow_validator_service_1.FlowValidatorService])
], FlowsService);
//# sourceMappingURL=flows.service.js.map