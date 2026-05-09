import { User } from './User.entity';
import { WorkflowExecution } from './WorkflowExecution.entity';
export declare enum WorkflowStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    INACTIVE = "inactive",
    ARCHIVED = "archived"
}
export declare enum WorkflowTriggerType {
    MANUAL = "manual",
    SCHEDULED = "scheduled",
    SENSOR_THRESHOLD = "sensor_threshold",
    ALERT = "alert",
    TIME_BASED = "time_based",
    EXTERNAL = "external"
}
export declare class Workflow {
    id: string;
    name: string;
    description: string;
    status: WorkflowStatus;
    triggerType: WorkflowTriggerType;
    graph: Record<string, any>;
    triggerConfig: Record<string, any>;
    tags: string;
    isActive: boolean;
    isPublished: boolean;
    executionCount: number;
    lastExecutedAt: Date;
    createdBy: User;
    updatedBy: User;
    createdAt: Date;
    updatedAt: Date;
    errorLog: string;
    metadata: Record<string, any>;
    executions: WorkflowExecution[];
    get isValid(): boolean;
}
