import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../database/entities/User.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            firstname: string;
            lastname: string;
            role: import("../database/entities/User.entity").UserRole;
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
            role: import("../database/entities/User.entity").UserRole;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            stations: any[];
            assignedMaintenances: any[];
            createdMaintenances: any[];
            createdWorkflows: any[];
        };
    }>;
    getCurrentUser(req: {
        user: User;
    }): Promise<User>;
    logout(): Promise<{
        message: string;
    }>;
}
