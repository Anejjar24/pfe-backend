export declare enum HistoryGranularity {
    MIN5 = "5min",
    MIN15 = "15min",
    MIN30 = "30min",
    HOUR = "hour",
    DAY = "day"
}
export declare const GRANULARITY_INTERVAL: Record<HistoryGranularity, string>;
export declare class SensorStatsQueryDto {
    from?: string;
    to?: string;
    granularity?: HistoryGranularity;
}
export declare class StationHistoryQueryDto {
    granularity?: HistoryGranularity;
    from?: string;
    to?: string;
}
