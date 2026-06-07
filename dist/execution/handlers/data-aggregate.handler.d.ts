import { Repository } from 'typeorm';
import { WorkflowNode } from '../../common/types/workflow.types';
import { Sensor } from '../../database/entities/Sensor.entity';
export declare class DataAggregateHandler {
    private readonly sensorRepo;
    constructor(sensorRepo: Repository<Sensor>);
    execute(node: WorkflowNode, input: unknown): Promise<{
        count: number;
        sum: number;
        min: number;
        max: number;
        avg: number;
        median: number;
        stddev: number;
        p95: number;
        branch: string;
        error?: undefined;
    } | {
        error: string;
        branch: string;
    } | {
        branch: string;
        min: number;
        max: number;
        avg: number;
        stationId: string;
        sensorType: string;
        count: number;
        activeCount: number;
        sensors: {
            id: string;
            name: string;
            value: number | null;
            unit: string;
            status: import("../../database/entities/Sensor.entity").SensorStatus;
        }[];
        error?: undefined;
    } | {
        branch: string;
        min: null;
        max: null;
        avg: null;
        stationId: string;
        sensorType: string;
        count: number;
        activeCount: number;
        sensors: {
            id: string;
            name: string;
            value: number | null;
            unit: string;
            status: import("../../database/entities/Sensor.entity").SensorStatus;
        }[];
        error?: undefined;
    } | {
        count: number;
        threshold: number;
        windowSeconds: number;
        thresholdReached: boolean;
        branch: string;
    } | {
        slope: number;
        direction: string;
        windowSize: number;
        branch: string;
        error?: undefined;
    } | {
        value: number;
        windowSize: number;
        sampleCount: number;
        branch: string;
        error?: undefined;
    } | {
        value: unknown;
        branch: string;
    }>;
    private stats;
    private stationStats;
    private eventCounter;
    private trend;
    private movingAverage;
    private numericArray;
}
