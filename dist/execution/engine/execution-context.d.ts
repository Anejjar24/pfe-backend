import { ExecutionStep } from '../../common/types/workflow.types';
export declare class ExecutionContext {
    readonly input: Record<string, unknown>;
    private readonly values;
    readonly steps: ExecutionStep[];
    constructor(input?: Record<string, unknown>);
    setValue(nodeId: string, value: unknown): void;
    getValue(nodeId: string): unknown;
    addStep(step: ExecutionStep): void;
}
