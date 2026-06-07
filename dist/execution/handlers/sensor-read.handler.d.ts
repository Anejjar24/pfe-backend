import { Repository } from 'typeorm';
import { WorkflowNode } from '../../common/types/workflow.types';
import { Sensor } from '../../database/entities/Sensor.entity';
import { SensorData } from '../../database/entities/SensorData.entity';
export declare class SensorReadHandler {
    private readonly sensorRepo;
    private readonly sensorDataRepo;
    constructor(sensorRepo: Repository<Sensor>, sensorDataRepo: Repository<SensorData>);
    execute(node: WorkflowNode, _input: unknown): Promise<{
        error: string;
        readings: never[];
        branch: string;
        count?: undefined;
        sensorId?: undefined;
    } | {
        readings: {
            id: string;
            value: number;
            timestamp: Date;
        }[];
        count: number;
        sensorId: string;
        branch: string;
        error?: undefined;
    } | {
        sensors: {
            sensorId: string;
            name: string;
            type: import("../../database/entities/Sensor.entity").SensorType;
            value: number | null;
            unit: string;
            status: import("../../database/entities/Sensor.entity").SensorStatus;
            timestamp: Date;
            stationId: string;
            stationName: string;
        }[];
        count: number;
        branch: string;
    } | {
        error: string;
        branch: string;
        sensorId?: undefined;
        name?: undefined;
        status?: undefined;
        reason?: undefined;
        lastReadingAt?: undefined;
        minutesSince?: undefined;
    } | {
        sensorId: string;
        name: string;
        status: string;
        reason: string;
        branch: string;
        error?: undefined;
        lastReadingAt?: undefined;
        minutesSince?: undefined;
    } | {
        sensorId: string;
        name: string;
        status: import("../../database/entities/Sensor.entity").SensorStatus;
        lastReadingAt: Date;
        minutesSince: number;
        branch: string;
        error?: undefined;
        reason?: undefined;
    } | {
        error: string;
        branch: string;
        sensorId?: undefined;
        current?: undefined;
        previous?: undefined;
        change?: undefined;
        changePercent?: undefined;
        direction?: undefined;
        significant?: undefined;
        value?: undefined;
    } | {
        sensorId: string;
        current: number;
        previous: null;
        change: null;
        changePercent: null;
        direction: string;
        significant: boolean;
        value: number;
        branch: string;
        error?: undefined;
    } | {
        sensorId: string;
        current: number;
        previous: number;
        change: number;
        changePercent: number;
        direction: string;
        significant: boolean;
        value: number;
        branch: string;
        error?: undefined;
    } | {
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
    private executeSingle;
    private executeHistory;
    private executeBatch;
    private executeStatusCheck;
    private executeDelta;
}
