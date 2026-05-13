import { StationsService } from '../../stations/stations.service';
import { StationStatus } from '../../database/entities/Station.entity';
import { WorkflowNode } from '../../common/types/workflow.types';
export declare class StationControlHandler {
    private readonly stationsService;
    constructor(stationsService: StationsService);
    execute(node: WorkflowNode, input: unknown): Promise<{
        error: string;
        updated: boolean;
        stationId?: undefined;
        name?: undefined;
        status?: undefined;
    } | {
        updated: boolean;
        stationId: string;
        name: string;
        status: StationStatus;
        error?: undefined;
    }>;
}
