import { FlowRecord } from '../database/schemas/flow.schema';
import { CreateFlowDto } from './dto/create-flow.dto';
import { FlowValidatorService } from './flow-validator.service';
export declare class FlowsService {
    private readonly validator;
    private readonly flows;
    constructor(validator: FlowValidatorService);
    create(dto: CreateFlowDto): FlowRecord;
    update(id: string, dto: CreateFlowDto): FlowRecord;
    findAll(): FlowRecord[];
    findOne(id: string): FlowRecord;
    remove(id: string): {
        deleted: boolean;
        id: string;
    };
}
