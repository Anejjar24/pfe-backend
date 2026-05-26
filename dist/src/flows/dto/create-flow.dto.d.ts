import { WorkflowGraph } from '../../common/types/workflow.types';
import { WorkflowTriggerType } from '../../database/entities/Workflow.entity';
export declare class CreateFlowDto {
    name?: string;
    graph: WorkflowGraph;
    triggerType?: WorkflowTriggerType;
    triggerConfig?: Record<string, unknown>;
    isActive?: boolean;
}
