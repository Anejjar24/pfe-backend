import { WorkflowNode } from '../../common/types/workflow.types';
export declare class SensorCheckHandler {
    execute(node: WorkflowNode, input: unknown): {
        value: number;
        level: string;
        warningThreshold: number;
        criticalThreshold: number;
        emergencyThreshold: number;
        branch: string;
    } | {
        current: number;
        previous: number;
        ratePerSec: number;
        branch: string;
    } | {
        current: number;
        previous: number;
        change: number;
        deadbandWidth: number;
        branch: string;
    } | {
        error: string;
        branch: string;
        value?: undefined;
        zscore?: undefined;
        mean?: undefined;
        stddev?: undefined;
        isAnomaly?: undefined;
    } | {
        value: number;
        zscore: number;
        mean: number;
        stddev: number;
        isAnomaly: boolean;
        branch: string;
        error?: undefined;
    } | {
        valueA: number;
        valueB: number;
        diff: number;
        branch: string;
    } | {
        currentTime: string;
        currentDay: number;
        dayAllowed: boolean;
        timeAllowed: boolean;
        branch: string;
    } | {
        value: unknown;
        branch: string;
    };
    private multiThreshold;
    private rateOfChange;
    private deadband;
    private anomaly;
    private compare;
    private timeWindow;
    private num;
    private obj;
    private numericArray;
}
