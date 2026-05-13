export declare enum HistoryGranularity {
    HOUR = "hour",
    DAY = "day"
}
export declare class SensorStatsQueryDto {
    from?: string;
    to?: string;
}
export declare class StationHistoryQueryDto {
    granularity?: HistoryGranularity;
    from?: string;
    to?: string;
}
