import { WorkflowNode } from '../../common/types/workflow.types';
import { ExecutionContext } from './execution-context';
export declare class NodeExecutor {
    private readonly inputHandler;
    private readonly actionHandler;
    private readonly decisionHandler;
    private readonly outputHandler;
    execute(node: WorkflowNode, input: unknown, context: ExecutionContext): Promise<unknown>;
}
