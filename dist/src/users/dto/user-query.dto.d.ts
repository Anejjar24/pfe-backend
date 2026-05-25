import { UserRole } from '../../database/entities/User.entity';
export declare class UserQueryDto {
    page?: number;
    limit?: number;
    role?: UserRole;
    search?: string;
    isActive?: boolean;
}
