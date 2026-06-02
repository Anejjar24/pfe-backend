import { WorkflowNode } from '../../common/types/workflow.types';
import { ExecutionContext } from '../engine/execution-context';
export declare class InputHandler {
    execute(node: WorkflowNode, context: ExecutionContext): any;
}
