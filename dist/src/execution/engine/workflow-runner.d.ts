import { ExecutionResult, WorkflowGraph } from '../../common/types/workflow.types';
import { NodeExecutor } from './node-executor';
export declare class WorkflowRunner {
    private readonly nodeExecutor;
    constructor(nodeExecutor: NodeExecutor);
    run(graph: WorkflowGraph, input?: Record<string, unknown>): Promise<ExecutionResult>;
    private groupEdges;
    private filterDecisionEdges;
}
