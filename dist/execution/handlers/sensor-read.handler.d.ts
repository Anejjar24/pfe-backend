import { Repository } from 'typeorm';
import { WorkflowNode } from '../../common/types/workflow.types';
import { Sensor } from '../../database/entities/Sensor.entity';
export declare class SensorReadHandler {
    private readonly sensorRepository;
    constructor(sensorRepository: Repository<Sensor>);
    execute(node: WorkflowNode): Promise<{
        error: string;
        value: null;
        status?: undefined;
        sensorId?: undefined;
        name?: undefined;
        unit?: undefined;
        timestamp?: undefined;
        stationId?: undefined;
    } | {
        error: string;
        value: null;
        status: string;
        sensorId?: undefined;
        name?: undefined;
        unit?: undefined;
        timestamp?: undefined;
        stationId?: undefined;
    } | {
        sensorId: string;
        name: string;
        value: number;
        unit: string;
        timestamp: Date;
        status: import("../../database/entities/Sensor.entity").SensorStatus;
        stationId: string;
        error?: undefined;
    }>;
}
