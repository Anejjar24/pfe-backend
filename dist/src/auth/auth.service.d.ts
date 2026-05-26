import { UpdateProfileDto } from './dto/update-profile.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Cache } from '@nestjs/cache-manager';
import { User, UserRole } from '../database/entities/User.entity';
import { PasswordUtil } from './utils/password.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly passwordUtil;
    private readonly configService;
    private readonly cacheManager;
    private readonly logger;
    constructor(userRepository: Repository<User>, jwtService: JwtService, passwordUtil: PasswordUtil, configService: ConfigService, cacheManager: Cache);
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
    logout(user: User, refreshToken?: string): Promise<{
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
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
        access_token: string;
        refresh_token: string;
    }>;
    updateProfile(user: User, dto: UpdateProfileDto): Promise<{
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
    }>;
    private generateTokens;
    private denylistToken;
    private denylistKey;
    private getRefreshSecret;
    private getUserResponse;
}
