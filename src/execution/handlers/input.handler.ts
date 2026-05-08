import { WorkflowNode } from '../../common/types/workflow.types';
import { ExecutionContext } from '../engine/execution-context';

export class InputHandler {
  execute(node: WorkflowNode, context: ExecutionContext) {
    return node.data?.value ?? context.input;
  }
}
