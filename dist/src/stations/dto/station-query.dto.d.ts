import { StationStatus, StationType } from '../../database/entities/Station.entity';
export declare class StationQueryDto {
    page?: number;
    limit?: number;
    status?: StationStatus;
    type?: StationType;
    search?: string;
}
