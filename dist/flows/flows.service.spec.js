"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const flows_service_1 = require("./flows.service");
const Workflow_entity_1 = require("../database/entities/Workflow.entity");
const WorkflowExecution_entity_1 = require("../database/entities/WorkflowExecution.entity");
const flow_validator_service_1 = require("./flow-validator.service");
const makeGraph = () => ({
    id: 'graph-uuid',
    nodes: [{ id: 'n1', type: 'input' }, { id: 'n2', type: 'output' }],
    edges: [{ source: 'n1', target: 'n2' }],
});
const makeWorkflow = (overrides = {}) => ({
    id: 'workflow-uuid',
    name: 'Test Workflow',
    graph: makeGraph(),
    triggerType: Workflow_entity_1.WorkflowTriggerType.MANUAL,
    triggerConfig: {},
    isActive: false,
    createdBy: null,
    updatedBy: null,
    ...overrides,
});
const makeUser = () => ({ id: 'user-uuid', name: 'Admin' });
const makeCreateDto = (overrides = {}) => ({
    name: 'Test Workflow',
    graph: makeGraph(),
    triggerType: Workflow_entity_1.WorkflowTriggerType.MANUAL,
    triggerConfig: {},
    isActive: false,
    ...overrides,
});
const mockWorkflowRepo = () => ({
    create: jest.fn((dto) => ({ ...dto })),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
});
const mockWorkflowExecutionRepo = () => ({
    create: jest.fn((dto) => ({ ...dto })),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
});
const mockFlowValidator = () => ({
    validate: jest.fn().mockReturnValue(true),
});
describe('FlowsService', () => {
    let service;
    let workflowRepo;
    let executionRepo;
    let validator;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                flows_service_1.FlowsService,
                { provide: (0, typeorm_1.getRepositoryToken)(Workflow_entity_1.Workflow), useFactory: mockWorkflowRepo },
                { provide: (0, typeorm_1.getRepositoryToken)(WorkflowExecution_entity_1.WorkflowExecution), useFactory: mockWorkflowExecutionRepo },
                { provide: flow_validator_service_1.FlowValidatorService, useFactory: mockFlowValidator },
            ],
        }).compile();
        service = module.get(flows_service_1.FlowsService);
        workflowRepo = module.get((0, typeorm_1.getRepositoryToken)(Workflow_entity_1.Workflow));
        executionRepo = module.get((0, typeorm_1.getRepositoryToken)(WorkflowExecution_entity_1.WorkflowExecution));
        validator = module.get(flow_validator_service_1.FlowValidatorService);
        workflowRepo.save.mockResolvedValue(makeWorkflow());
        workflowRepo.findOne.mockResolvedValue(null);
        workflowRepo.find.mockResolvedValue([]);
        workflowRepo.remove.mockResolvedValue(undefined);
    });
    describe('create', () => {
        it('validates the graph before saving', async () => {
            const dto = makeCreateDto();
            workflowRepo.save.mockResolvedValue(makeWorkflow());
            await service.create(dto, makeUser());
            expect(validator.validate).toHaveBeenCalledWith(dto.graph);
        });
        it('creates and saves the workflow', async () => {
            const dto = makeCreateDto();
            const saved = makeWorkflow({ name: 'Test Workflow' });
            workflowRepo.save.mockResolvedValue(saved);
            const result = await service.create(dto, makeUser());
            expect(workflowRepo.create).toHaveBeenCalled();
            expect(workflowRepo.save).toHaveBeenCalled();
            expect(result).toEqual(saved);
        });
        it('uses graph.id as workflow id when graph.id is provided', async () => {
            const dto = makeCreateDto({ graph: { ...makeGraph(), id: 'my-graph-id' } });
            workflowRepo.save.mockResolvedValue(makeWorkflow());
            await service.create(dto, makeUser());
            expect(workflowRepo.create).toHaveBeenCalledWith(expect.objectContaining({ id: 'my-graph-id' }));
        });
        it('defaults isActive to false when not provided', async () => {
            const dto = makeCreateDto({ isActive: undefined });
            workflowRepo.save.mockResolvedValue(makeWorkflow());
            await service.create(dto, makeUser());
            expect(workflowRepo.create).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
        });
        it('defaults triggerType to MANUAL when not provided', async () => {
            const dto = makeCreateDto({ triggerType: undefined });
            workflowRepo.save.mockResolvedValue(makeWorkflow());
            await service.create(dto, makeUser());
            expect(workflowRepo.create).toHaveBeenCalledWith(expect.objectContaining({ triggerType: Workflow_entity_1.WorkflowTriggerType.MANUAL }));
        });
    });
    describe('findAll', () => {
        it('returns all workflows', async () => {
            const workflows = [makeWorkflow(), makeWorkflow({ id: 'workflow-2' })];
            workflowRepo.find.mockResolvedValue(workflows);
            const result = await service.findAll();
            expect(result).toEqual(workflows);
            expect(workflowRepo.find).toHaveBeenCalledWith(expect.objectContaining({ relations: ['createdBy'] }));
        });
        it('returns empty array when no workflows exist', async () => {
            workflowRepo.find.mockResolvedValue([]);
            await expect(service.findAll()).resolves.toEqual([]);
        });
    });
    describe('findOne', () => {
        it('returns workflow when found', async () => {
            const workflow = makeWorkflow();
            workflowRepo.findOne.mockResolvedValue(workflow);
            await expect(service.findOne('workflow-uuid')).resolves.toEqual(workflow);
        });
        it('throws NotFoundException when workflow does not exist', async () => {
            workflowRepo.findOne.mockResolvedValue(null);
            await expect(service.findOne('nonexistent')).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
    describe('update', () => {
        it('validates graph and saves updated workflow', async () => {
            const existing = makeWorkflow();
            workflowRepo.findOne.mockResolvedValue(existing);
            const updated = makeWorkflow({ name: 'Renamed' });
            workflowRepo.save.mockResolvedValue(updated);
            const dto = makeCreateDto({ name: 'Renamed' });
            const result = await service.update('workflow-uuid', dto);
            expect(validator.validate).toHaveBeenCalledWith(dto.graph);
            expect(workflowRepo.save).toHaveBeenCalled();
            expect(result).toEqual(updated);
        });
        it('sets updatedBy when user is provided', async () => {
            const existing = makeWorkflow();
            workflowRepo.findOne.mockResolvedValue(existing);
            workflowRepo.save.mockResolvedValue(existing);
            const user = makeUser();
            await service.update('workflow-uuid', makeCreateDto(), user);
            expect(existing.updatedBy).toEqual(user);
        });
        it('updates triggerType and isActive when provided in dto', async () => {
            const existing = makeWorkflow();
            workflowRepo.findOne.mockResolvedValue(existing);
            workflowRepo.save.mockResolvedValue(existing);
            const dto = makeCreateDto({
                triggerType: Workflow_entity_1.WorkflowTriggerType.SCHEDULED,
                isActive: true,
            });
            await service.update('workflow-uuid', dto);
            expect(existing.triggerType).toBe(Workflow_entity_1.WorkflowTriggerType.SCHEDULED);
            expect(existing.isActive).toBe(true);
        });
        it('throws NotFoundException when workflow does not exist', async () => {
            workflowRepo.findOne.mockResolvedValue(null);
            await expect(service.update('nonexistent', makeCreateDto())).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
    describe('activate', () => {
        it('sets isActive to true and saves', async () => {
            const workflow = makeWorkflow({ isActive: false });
            workflowRepo.findOne.mockResolvedValue(workflow);
            workflowRepo.save.mockResolvedValue({ ...workflow, isActive: true });
            const result = await service.activate('workflow-uuid');
            expect(workflow.isActive).toBe(true);
            expect(workflowRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isActive: true }));
            expect(result).toHaveProperty('isActive', true);
        });
        it('throws NotFoundException when workflow does not exist', async () => {
            workflowRepo.findOne.mockResolvedValue(null);
            await expect(service.activate('nonexistent')).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
    describe('deactivate', () => {
        it('sets isActive to false and saves', async () => {
            const workflow = makeWorkflow({ isActive: true });
            workflowRepo.findOne.mockResolvedValue(workflow);
            workflowRepo.save.mockResolvedValue({ ...workflow, isActive: false });
            const result = await service.deactivate('workflow-uuid');
            expect(workflow.isActive).toBe(false);
            expect(workflowRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
            expect(result).toHaveProperty('isActive', false);
        });
        it('throws NotFoundException when workflow does not exist', async () => {
            workflowRepo.findOne.mockResolvedValue(null);
            await expect(service.deactivate('nonexistent')).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
    describe('remove', () => {
        it('removes workflow and returns { deleted: true, id }', async () => {
            const workflow = makeWorkflow();
            workflowRepo.findOne.mockResolvedValue(workflow);
            const result = await service.remove('workflow-uuid');
            expect(workflowRepo.remove).toHaveBeenCalledWith(workflow);
            expect(result).toEqual({ deleted: true, id: 'workflow-uuid' });
        });
        it('throws NotFoundException when workflow does not exist', async () => {
            workflowRepo.findOne.mockResolvedValue(null);
            await expect(service.remove('nonexistent')).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=flows.service.spec.js.map