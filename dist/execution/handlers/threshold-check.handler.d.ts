import { WorkflowNode } from '../../common/types/workflow.types';
export declare class ThresholdCheckHandler {
    execute(node: WorkflowNode, input: unknown): {
        value: number;
        breach: boolean;
        pass: boolean;
        min: number | null;
        max: number | null;
        mode: string;
        branch: string;
    };
}
