import { User } from '../database/entities/User.entity';
import { CreateFlowDto } from './dto/create-flow.dto';
import { ExecuteFlowDto } from './dto/execute-flow.dto';
import { FlowExecutorService } from './flow-executor.service';
import { FlowsService } from './flows.service';
export declare class FlowsController {
    private readonly flowsService;
    private readonly executorService;
    constructor(flowsService: FlowsService, executorService: FlowExecutorService);
    create(dto: CreateFlowDto, req: {
        user: User;
    }): Promise<import("../database/entities/Workflow.entity").Workflow>;
    findAll(): Promise<import("../database/entities/Workflow.entity").Workflow[]>;
    findOne(id: string): Promise<import("../database/entities/Workflow.entity").Workflow>;
    update(id: string, dto: CreateFlowDto, req: {
        user: User;
    }): Promise<import("../database/entities/Workflow.entity").Workflow>;
    remove(id: string): Promise<{
        deleted: boolean;
        id: string;
    }>;
    execute(dto: ExecuteFlowDto): Promise<import("../common/types/workflow.types").ExecutionResult>;
}
