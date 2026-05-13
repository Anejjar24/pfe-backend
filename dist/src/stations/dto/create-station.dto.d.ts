import { StationStatus, StationType } from '../../database/entities/Station.entity';
export declare class CreateStationDto {
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    capacity: number;
    capacityUnit?: string;
    type?: StationType;
    status?: StationStatus;
    description?: string;
    equipments?: string[];
    metadata?: Record<string, any>;
}
