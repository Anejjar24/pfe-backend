import { Workflow } from './Workflow.entity';
import { User } from './User.entity';
export declare enum WorkflowExecutionStatus {
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    PAUSED = "paused"
}
export declare class WorkflowExecution {
    id: string;
    workflow: Workflow;
    status: WorkflowExecutionStatus;
    input: Record<string, any>;
    output: Record<string, any>;
    executionLog: Record<string, any>[];
    triggeredBy: User;
    triggerSource: string;
    errorMessage: string;
    duration: number;
    startedAt: Date;
    completedAt: Date;
    nodeStates: Record<string, any>;
    nodeExecutionCount: number;
    successCount: number;
    failureCount: number;
    currentNode: string;
    stackTrace: string;
    metadata: Record<string, any>;
    get isRunning(): boolean;
    get isSuccessful(): boolean;
    get hasError(): boolean;
}
