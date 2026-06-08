"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const cache_manager_1 = require("@nestjs/cache-manager");
const auth_service_1 = require("./auth.service");
const password_util_1 = require("./utils/password.util");
const User_entity_1 = require("../database/entities/User.entity");
const mockUser = () => ({
    id: 'user-uuid',
    email: 'test@aquaflow.io',
    password: 'hashed_pw',
    firstname: 'Test',
    lastname: 'User',
    role: User_entity_1.UserRole.OPERATOR,
    isActive: true,
});
const mockUserRepo = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
});
const mockJwtService = () => ({
    sign: jest.fn(() => 'mock_token'),
    verify: jest.fn(),
});
const mockPasswordUtil = () => ({
    hashPassword: jest.fn(),
    comparePasswords: jest.fn(),
});
const mockConfigService = () => ({
    get: jest.fn((key) => {
        const cfg = {
            JWT_SECRET: 'test-secret',
            JWT_REFRESH_SECRET: 'test-refresh-secret',
        };
        return cfg[key];
    }),
});
const mockCacheManager = () => ({
    get: jest.fn(),
    set: jest.fn(),
});
describe('AuthService', () => {
    let service;
    let userRepo;
    let jwtService;
    let passwordUtil;
    let cacheManager;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: (0, typeorm_1.getRepositoryToken)(User_entity_1.User), useFactory: mockUserRepo },
                { provide: jwt_1.JwtService, useFactory: mockJwtService },
                { provide: password_util_1.PasswordUtil, useFactory: mockPasswordUtil },
                { provide: config_1.ConfigService, useFactory: mockConfigService },
                { provide: cache_manager_1.CACHE_MANAGER, useFactory: mockCacheManager },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        userRepo = module.get((0, typeorm_1.getRepositoryToken)(User_entity_1.User));
        jwtService = module.get(jwt_1.JwtService);
        passwordUtil = module.get(password_util_1.PasswordUtil);
        cacheManager = module.get(cache_manager_1.CACHE_MANAGER);
        cacheManager.get.mockResolvedValue(null);
        cacheManager.set.mockResolvedValue(undefined);
        passwordUtil.hashPassword.mockResolvedValue('hashed_pw');
        passwordUtil.comparePasswords.mockResolvedValue(true);
        jwtService.sign.mockReturnValue('mock_token');
    });
    describe('validateUser', () => {
        it('returns user when found and active', async () => {
            const user = mockUser();
            userRepo.findOne.mockResolvedValue(user);
            await expect(service.validateUser('user-uuid')).resolves.toEqual(user);
        });
        it('throws UnauthorizedException when user not found', async () => {
            userRepo.findOne.mockResolvedValue(null);
            await expect(service.validateUser('unknown')).rejects.toBeInstanceOf(common_1.UnauthorizedException);
        });
        it('throws UnauthorizedException when user is inactive', async () => {
            userRepo.findOne.mockResolvedValue({ ...mockUser(), isActive: false });
            await expect(service.validateUser('user-uuid')).rejects.toBeInstanceOf(common_1.UnauthorizedException);
        });
    });
    describe('login', () => {
        it('returns tokens and user on valid credentials', async () => {
            const user = mockUser();
            userRepo.findOne.mockResolvedValue(user);
            passwordUtil.comparePasswords.mockResolvedValue(true);
            jwtService.sign.mockReturnValue('jwt_token');
            const result = await service.login({ email: user.email, password: 'pw' });
            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');
            expect(result.user.email).toBe(user.email);
            expect(result.user).not.toHaveProperty('password');
        });
        it('throws UnauthorizedException when user not found', async () => {
            userRepo.findOne.mockResolvedValue(null);
            await expect(service.login({ email: 'x@x.com', password: 'pw' })).rejects.toBeInstanceOf(common_1.UnauthorizedException);
        });
        it('throws UnauthorizedException when password is wrong', async () => {
            userRepo.findOne.mockResolvedValue(mockUser());
            passwordUtil.comparePasswords.mockResolvedValue(false);
            await expect(service.login({ email: 'test@aquaflow.io', password: 'wrong' })).rejects.toBeInstanceOf(common_1.UnauthorizedException);
        });
        it('throws UnauthorizedException when account is disabled', async () => {
            userRepo.findOne.mockResolvedValue({ ...mockUser(), isActive: false });
            await expect(service.login({ email: 'test@aquaflow.io', password: 'pw' })).rejects.toBeInstanceOf(common_1.UnauthorizedException);
        });
    });
    describe('register', () => {
        it('throws ConflictException when email already exists', async () => {
            userRepo.findOne.mockResolvedValue(mockUser());
            await expect(service.register({
                email: 'test@aquaflow.io',
                password: 'pw',
                firstname: 'A',
                lastname: 'B',
            })).rejects.toBeInstanceOf(common_1.ConflictException);
        });
        it('creates user and returns tokens on success', async () => {
            const user = mockUser();
            userRepo.findOne.mockResolvedValue(null);
            userRepo.create.mockReturnValue(user);
            userRepo.save.mockResolvedValue(user);
            jwtService.sign.mockReturnValue('jwt_token');
            const result = await service.register({
                email: user.email,
                password: 'pw',
                firstname: 'Test',
                lastname: 'User',
            });
            expect(result).toHaveProperty('access_token');
            expect(result.user.email).toBe(user.email);
        });
    });
    describe('logout', () => {
        it('returns success message', async () => {
            const result = await service.logout(mockUser());
            expect(result.message).toMatch(/logged out/i);
        });
        it('denylists refresh token when provided', async () => {
            await service.logout(mockUser(), 'some_refresh_token');
            expect(cacheManager.set).toHaveBeenCalledWith(expect.stringMatching(/^rt:deny:/), '1', expect.any(Number));
        });
    });
    describe('refreshToken', () => {
        it('throws UnauthorizedException when token is denylisted', async () => {
            cacheManager.get.mockResolvedValue('1');
            await expect(service.refreshToken('denylisted_token')).rejects.toBeInstanceOf(common_1.UnauthorizedException);
        });
        it('rotates tokens on valid refresh token', async () => {
            const user = mockUser();
            cacheManager.get.mockResolvedValue(null);
            jwtService.verify.mockReturnValue({ sub: user.id, email: user.email });
            userRepo.findOne.mockResolvedValue(user);
            jwtService.sign.mockReturnValue('new_token');
            const result = await service.refreshToken('valid_refresh_token');
            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');
            expect(cacheManager.set).toHaveBeenCalledWith(expect.stringMatching(/^rt:deny:/), '1', expect.any(Number));
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map