import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from '../database/entities/User.entity';
import { PasswordUtil } from './utils/password.util';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly passwordUtil: PasswordUtil,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstname, lastname } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordUtil.hashPassword(password);

    // Create new user
    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      role: UserRole.OPERATOR,
      isActive: true,
    });

    try {
      const savedUser = await this.userRepository.save(newUser);
      this.logger.log(`New user registered: ${email}`);

      const { access_token, refresh_token } = await this.generateTokens(
        savedUser,
      );

      return {
        access_token,
        refresh_token,
        user: this.getUserResponse(savedUser),
      };
    } catch (error) {
      this.logger.error(`User registration failed: ${email}`, error);
      throw new BadRequestException('Failed to create user');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is disabled');
    }

    // Verify password
    const isPasswordValid = await this.passwordUtil.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.log(`User logged in: ${email}`);

    const { access_token, refresh_token } = await this.generateTokens(user);

    return {
      access_token,
      refresh_token,
      user: this.getUserResponse(user),
    };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or account disabled');
    }

    return user;
  }

  async logout(user: User) {
    this.logger.log(`User logged out: ${user.email}`);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return { access_token, refresh_token };
  }

  private getUserResponse(user: User) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
