import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User, UserRole } from '../database/entities/User.entity';
import { PasswordUtil } from './utils/password.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly passwordUtil;
    private readonly logger;
    constructor(userRepository: Repository<User>, jwtService: JwtService, passwordUtil: PasswordUtil);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            firstname: string;
            lastname: string;
            role: UserRole;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            stations: any[];
            assignedMaintenances: any[];
            createdMaintenances: any[];
            createdWorkflows: any[];
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            firstname: string;
            lastname: string;
            role: UserRole;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            stations: any[];
            assignedMaintenances: any[];
            createdMaintenances: any[];
            createdWorkflows: any[];
        };
    }>;
    validateUser(id: string): Promise<User>;
    private generateTokens;
    private getUserResponse;
}
