import { WorkflowNode } from '../../common/types/workflow.types';
export declare class HttpRequestHandler {
    execute(node: WorkflowNode, input: unknown): Promise<{
        error: string;
        ok: boolean;
        status?: undefined;
        statusText?: undefined;
        data?: undefined;
        branch?: undefined;
    } | {
        ok: boolean;
        status: number;
        statusText: string;
        data: unknown;
        branch: string;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
        branch: string;
        status?: undefined;
        statusText?: undefined;
        data?: undefined;
    }>;
}
