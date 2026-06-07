import { WorkflowNode } from '../../common/types/workflow.types';
export declare class ValueTransformHandler {
    execute(node: WorkflowNode, input: unknown): {
        value: number;
        original: number;
        branch: string;
    } | {
        value: number;
        label: null;
        branch: string;
    } | {
        value: number;
        label: string;
        branch: string;
    } | {
        value: number;
        branch: string;
        error?: undefined;
    } | {
        error: string;
        branch: string;
        value?: undefined;
    };
    private normalize;
    private unitConvert;
    private round;
    private clamp;
    private map;
    private extractNumeric;
}
