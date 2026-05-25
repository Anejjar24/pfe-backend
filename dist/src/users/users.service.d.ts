import { Repository } from 'typeorm';
import { User } from '../database/entities/User.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
export type SafeUser = Omit<User, 'password'>;
export declare class UsersService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    findAll(query: UserQueryDto): Promise<{
        data: SafeUser[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findForDropdown(role?: string): Promise<SafeUser[]>;
    findOne(id: string): Promise<SafeUser>;
    update(id: string, dto: UpdateUserDto): Promise<SafeUser>;
}
