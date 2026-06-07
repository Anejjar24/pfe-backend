import { WorkflowNode } from '../../common/types/workflow.types';
export declare class DataTransformHandler {
    execute(node: WorkflowNode, input: unknown): {
        value: unknown;
        branch: string;
        error?: undefined;
    } | {
        error: string;
        branch: string;
        value?: undefined;
    };
    private transform;
}
