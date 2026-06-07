import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(query: UserQueryDto, dropdown?: string): Promise<import("./users.service").SafeUser[]> | Promise<{
        data: import("./users.service").SafeUser[];
        meta: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    findOne(id: string): Promise<import("./users.service").SafeUser>;
    update(id: string, dto: UpdateUserDto): Promise<import("./users.service").SafeUser>;
}
