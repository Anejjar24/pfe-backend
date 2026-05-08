import { WorkflowNode } from '../../common/types/workflow.types';
export declare class DecisionHandler {
    execute(node: WorkflowNode, input: unknown): {
        value: unknown;
        branch: string;
        passed: boolean;
    };
}
