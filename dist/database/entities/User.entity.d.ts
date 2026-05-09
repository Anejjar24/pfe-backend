export declare enum UserRole {
    ADMIN = "admin",
    OPERATOR = "operator",
    TECHNICIAN = "technician",
    ANALYST = "analyst"
}
export declare class User {
    id: string;
    email: string;
    password: string;
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
    get fullName(): string;
}
