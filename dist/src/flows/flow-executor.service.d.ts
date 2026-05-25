import { Repository } from 'typeorm';
import { ExecutionResult, WorkflowGraph } from '../common/types/workflow.types';
import { WorkflowExecution } from '../database/entities/WorkflowExecution.entity';
import { Workflow } from '../database/entities/Workflow.entity';
import { User } from '../database/entities/User.entity';
import { WorkflowRunner } from '../execution/engine/workflow-runner';
import { FlowValidatorService } from './flow-validator.service';
export interface ExecuteOptions {
    workflowId?: string;
    user?: User;
    triggerSource?: string;
}
export declare class FlowExecutorService {
    private readonly validator;
    private readonly runner;
    private readonly executionRepo;
    private readonly workflowRepo;
    private readonly logger;
    constructor(validator: FlowValidatorService, runner: WorkflowRunner, executionRepo: Repository<WorkflowExecution>, workflowRepo: Repository<Workflow>);
    execute(graph: WorkflowGraph, input?: Record<string, unknown>, options?: ExecuteOptions): Promise<ExecutionResult>;
}
