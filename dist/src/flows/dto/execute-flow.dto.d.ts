import { WorkflowGraph } from '../../common/types/workflow.types';
export declare class ExecuteFlowDto {
    graph: WorkflowGraph;
    input?: Record<string, unknown>;
}
