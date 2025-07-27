import { UserRepository } from '@repositories/user.repository';
import { pool } from '@database/connection';
import bcrypt from 'bcryptjs';
import { generateToken } from '@config/jwt';
import { AppError } from '@middleware/error.middleware';
import { RegisterRequest, LoginRequest, User, UserRole } from '@vendor-supplier/shared/src/types';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository(pool);
  }

  async register(userData: RegisterRequest): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409, 'EMAIL_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const newUser: Partial<User> = {
      username: userData.username,
      email: userData.email,
      passwordHash: hashedPassword,
      role: userData.role as UserRole,
      contactNumber: userData.contactNumber,
      address: userData.address,
      city: userData.city,
      pincode: userData.pincode,
      companyName: userData.companyName,
      gstin: userData.gstin,
    };

    const createdUser = await this.userRepository.createUser(newUser);

    if (!createdUser) {
      throw new AppError('Failed to register user', 500, 'REGISTRATION_FAILED');
    }

    return createdUser;
  }

  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken(user.id, user.role);
    return { user, token };
  }

  async refreshToken(userId: string, role: UserRole): Promise<string> {
    // In a real application, you'd verify the refresh token from a database
    // and then issue a new access token.
    const newToken = generateToken(userId, role);
    return newToken;
  }

  async logout(userId: string): Promise<boolean> {
    // Invalidate token or remove from active sessions if tracked
    // For stateless JWTs, simply client-side token removal is common
    return true;
  }
}