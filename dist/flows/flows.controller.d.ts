import { CreateFlowDto } from './dto/create-flow.dto';
import { ExecuteFlowDto } from './dto/execute-flow.dto';
import { FlowExecutorService } from './flow-executor.service';
import { FlowsService } from './flows.service';
export declare class FlowsController {
    private readonly flowsService;
    private readonly executorService;
    constructor(flowsService: FlowsService, executorService: FlowExecutorService);
    create(dto: CreateFlowDto): import("../database/schemas/flow.schema").FlowRecord;
    findAll(): import("../database/schemas/flow.schema").FlowRecord[];
    findOne(id: string): import("../database/schemas/flow.schema").FlowRecord;
    update(id: string, dto: CreateFlowDto): import("../database/schemas/flow.schema").FlowRecord;
    remove(id: string): {
        deleted: boolean;
        id: string;
    };
    execute(dto: ExecuteFlowDto): Promise<import("../common/types/workflow.types").ExecutionResult>;
}
