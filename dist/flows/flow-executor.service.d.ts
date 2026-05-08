import { ExecutionResult, WorkflowGraph } from '../common/types/workflow.types';
import { WorkflowRunner } from '../execution/engine/workflow-runner';
import { FlowValidatorService } from './flow-validator.service';
export declare class FlowExecutorService {
    private readonly validator;
    private readonly runner;
    constructor(validator: FlowValidatorService, runner: WorkflowRunner);
    execute(graph: WorkflowGraph, input?: Record<string, unknown>): Promise<ExecutionResult>;
}
