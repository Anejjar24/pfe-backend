import { Repository } from 'typeorm';
import { WorkflowNode } from '../../common/types/workflow.types';
import { Sensor } from '../../database/entities/Sensor.entity';
import { SensorData } from '../../database/entities/SensorData.entity';
export declare class DataOutputHandler {
    private readonly sensorDataRepo;
    private readonly sensorRepo;
    constructor(sensorDataRepo: Repository<SensorData>, sensorRepo: Repository<Sensor>);
    execute(node: WorkflowNode, input: unknown): Promise<{
        branch: string;
    } | {
        value: unknown;
        branch: string;
    }>;
    private log;
    private reportBuilder;
    private csvFormat;
    private enrich;
    private numericValue;
    private toArray;
}
