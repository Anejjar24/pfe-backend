import { ExecutionResult, WorkflowGraph } from '../../common/types/workflow.types';
import { RealtimeService } from '../../realtime/realtime.service';
import { NodeExecutor } from './node-executor';
export declare class WorkflowRunner {
    private readonly nodeExecutor;
    private readonly realtimeService;
    constructor(nodeExecutor: NodeExecutor, realtimeService: RealtimeService);
    run(graph: WorkflowGraph, input?: Record<string, unknown>, userId?: string): Promise<ExecutionResult>;
    private groupEdges;
    private unwrapBranchValue;
    private filterDecisionEdges;
}
