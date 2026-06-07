import { WorkflowNode } from '../../common/types/workflow.types';
export declare class StreamFilterHandler {
    execute(node: WorkflowNode, input: unknown): {
        value: any;
        suppressed: number;
        originalCount: number;
        intervalMs: number;
        branch: string;
    } | {
        value: unknown;
        intervalMs: number;
        branch: string;
        suppressed?: undefined;
        originalCount?: undefined;
    } | {
        items: any[];
        originalCount: number;
        keptCount: number;
        intervalMs: number;
        branch: string;
        value?: undefined;
    } | {
        value: unknown;
        intervalMs: number;
        branch: string;
        items?: undefined;
        originalCount?: undefined;
        keptCount?: undefined;
    } | {
        items: any[];
        originalCount: number;
        sampledCount: number;
        sampleRate: string;
        branch: string;
        value?: undefined;
        sampleEvery?: undefined;
    } | {
        value: unknown;
        sampleEvery: number;
        branch: string;
        items?: undefined;
        originalCount?: undefined;
        sampledCount?: undefined;
        sampleRate?: undefined;
    } | {
        count: number;
        burstThreshold: number;
        burstWindowMs: number;
        isBurst: boolean;
        items: any[] | undefined;
        branch: string;
    } | {
        value: unknown;
        branch: string;
        error?: undefined;
    } | {
        error: string;
        branch: string;
        value?: undefined;
    };
    private debounce;
    private throttle;
    private sample;
    private burstDetect;
}
