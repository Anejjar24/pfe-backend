"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const User_entity_1 = require("../database/entities/User.entity");
const password_util_1 = require("./utils/password.util");
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepository, jwtService, passwordUtil, configService, cacheManager) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordUtil = passwordUtil;
        this.configService = configService;
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(registerDto) {
        const { email, password, firstname, lastname } = registerDto;
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await this.passwordUtil.hashPassword(password);
        const newUser = this.userRepository.create({
            email,
            password: hashedPassword,
            firstname,
            lastname,
            role: User_entity_1.UserRole.OPERATOR,
            isActive: true,
        });
        try {
            const savedUser = await this.userRepository.save(newUser);
            this.logger.log(`New user registered: ${email}`);
            const { access_token, refresh_token } = await this.generateTokens(savedUser);
            return { access_token, refresh_token, user: this.getUserResponse(savedUser) };
        }
        catch (error) {
            this.logger.error(`User registration failed: ${email}`, error);
            throw new common_1.BadRequestException('Failed to create user');
        }
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password');
        if (!user.isActive)
            throw new common_1.UnauthorizedException('User account is disabled');
        const isPasswordValid = await this.passwordUtil.comparePasswords(password, user.password);
        if (!isPasswordValid)
            throw new common_1.UnauthorizedException('Invalid email or password');
        this.logger.log(`User logged in: ${email}`);
        const { access_token, refresh_token } = await this.generateTokens(user);
        return { access_token, refresh_token, user: this.getUserResponse(user) };
    }
    async validateUser(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or account disabled');
        }
        return user;
    }
    async logout(user, refreshToken) {
        if (refreshToken) {
            await this.denylistToken(refreshToken);
        }
        this.logger.log(`User logged out: ${user.email}`);
        return { message: 'Logged out successfully' };
    }
    async refreshToken(refreshToken) {
        const isDenylisted = await this.cacheManager.get(this.denylistKey(refreshToken));
        if (isDenylisted) {
            throw new common_1.UnauthorizedException('Refresh token has been revoked');
        }
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.getRefreshSecret(),
            });
            const user = await this.validateUser(payload.sub);
            await this.denylistToken(refreshToken);
            const tokens = await this.generateTokens(user);
            return { ...tokens, user: this.getUserResponse(user) };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async updateProfile(user, dto) {
        if (dto.firstname !== undefined)
            user.firstname = dto.firstname;
        if (dto.lastname !== undefined)
            user.lastname = dto.lastname;
        if (dto.password !== undefined) {
            user.password = await this.passwordUtil.hashPassword(dto.password);
        }
        const saved = await this.userRepository.save(user);
        this.logger.log(`Profile updated: ${user.email}`);
        return this.getUserResponse(saved);
    }
    async generateTokens(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const access_token = this.jwtService.sign(payload, { expiresIn: '1h' });
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.getRefreshSecret(),
            expiresIn: '7d',
        });
        return { access_token, refresh_token };
    }
    async denylistToken(token) {
        await this.cacheManager.set(this.denylistKey(token), '1', REFRESH_TOKEN_TTL_SECONDS * 1000);
    }
    denylistKey(token) {
        const hash = (0, crypto_1.createHash)('sha256').update(token).digest('hex');
        return `rt:deny:${hash}`;
    }
    getRefreshSecret() {
        return (this.configService.get('JWT_REFRESH_SECRET') ||
            this.configService.get('JWT_SECRET') ||
            'your-secret-key');
    }
    getUserResponse(user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(User_entity_1.User)),
    __param(4, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        jwt_1.JwtService,
        password_util_1.PasswordUtil,
        config_1.ConfigService,
        cache_manager_1.Cache])
], AuthService);
//# sourceMappingURL=auth.service.js.map