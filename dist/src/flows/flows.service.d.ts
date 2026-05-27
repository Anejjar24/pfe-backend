import { Repository } from 'typeorm';
import { Workflow } from '../database/entities/Workflow.entity';
import { WorkflowExecution } from '../database/entities/WorkflowExecution.entity';
import { User } from '../database/entities/User.entity';
import { CreateFlowDto } from './dto/create-flow.dto';
import { FlowValidatorService } from './flow-validator.service';
export declare class FlowsService {
    private readonly workflowRepository;
    private readonly executionRepository;
    private readonly validator;
    constructor(workflowRepository: Repository<Workflow>, executionRepository: Repository<WorkflowExecution>, validator: FlowValidatorService);
    create(dto: CreateFlowDto, user: User): Promise<Workflow>;
    findAll(): Promise<Workflow[]>;
    findOne(id: string): Promise<Workflow>;
    update(id: string, dto: CreateFlowDto, user?: User): Promise<Workflow>;
    activate(id: string): Promise<Workflow>;
    deactivate(id: string): Promise<Workflow>;
    remove(id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    getExecutions(workflowId: string): Promise<WorkflowExecution[]>;
}
