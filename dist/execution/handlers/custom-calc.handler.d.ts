import { Repository } from 'typeorm';
import { WorkflowNode } from '../../common/types/workflow.types';
import { Sensor } from '../../database/entities/Sensor.entity';
import { SensorData } from '../../database/entities/SensorData.entity';
export declare class CustomCalcHandler {
    private readonly sensorRepo;
    private readonly sensorDataRepo;
    constructor(sensorRepo: Repository<Sensor>, sensorDataRepo: Repository<SensorData>);
    execute(node: WorkflowNode, _input: unknown): Promise<{
        error: string;
        branch: string;
        result?: undefined;
        series?: undefined;
        count?: undefined;
        formula?: undefined;
        aggregation?: undefined;
        resampleStrategy?: undefined;
        variables?: undefined;
    } | {
        result: number;
        series: {
            timestamp: Date;
            value: number;
        }[];
        count: number;
        formula: string;
        aggregation: string;
        resampleStrategy: string;
        variables: string[];
        branch: string;
        error?: undefined;
    }>;
    private resolveTimeRange;
    private fetchSeries;
    private alignSeries;
    private interpolate;
    private forwardFill;
    private downsampleAlign;
    private evaluateFormula;
    private aggValues;
    private aggregate;
}
