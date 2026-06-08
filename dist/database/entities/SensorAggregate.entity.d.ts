export declare class SensorAggregate {
    sensorId: string;
    bucket: Date;
    granularity: string;
    stationId: string;
    avgValue: number | null;
    minValue: number | null;
    maxValue: number | null;
    stddevValue: number | null;
    readingCount: number | null;
    anomalyFlag: boolean;
    rollingMean: number | null;
    rollingStddev: number | null;
    computedAt: Date;
}
