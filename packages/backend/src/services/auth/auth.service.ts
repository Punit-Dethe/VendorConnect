import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, generateRefreshToken } from '../../config/jwt';
import { AppError } from '../../middleware/error.middleware';
import { UserRegistration, UserLogin, AuthResponse, User } from '../../types/shared';

// In-memory storage for mock data (replace with database in production)
interface StoredUser {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  passwordHash: string;
  role: 'vendor' | 'supplier';
  businessType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  trustScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class MockDatabase {
  private users: StoredUser[] = [];

  // Pre-populate with some test users
  constructor() {
    this.users = [
      {
        id: 'vendor-1',
        name: 'Raj Kumar',
        mobile: '9876543210',
        email: 'raj@example.com',
        passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RjkYQ1Wye', // password: 'password123'
        role: 'vendor',
        businessType: 'Street Food Cart',
        address: '123 Street Food Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        trustScore: 75,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'supplier-1',
        name: 'Priya Sharma',
        mobile: '9876543211',
        email: 'priya@example.com',
        passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RjkYQ1Wye', // password: 'password123'
        role: 'supplier',
        businessType: 'Vegetable Supplier',
        address: '456 Market Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002',
        trustScore: 85,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];
  }

  findUserByMobileOrEmail(mobile: string, email?: string): StoredUser | undefined {
    return this.users.find(user =>
      user.mobile === mobile || (email && user.email === email)
    );
  }

  findUserByMobile(mobile: string): StoredUser | undefined {
    return this.users.find(user => user.mobile === mobile && user.isActive);
  }

  findUserById(id: string): StoredUser | undefined {
    return this.users.find(user => user.id === id && user.isActive);
  }

  createUser(userData: Omit<StoredUser, 'id' | 'createdAt' | 'updatedAt'>): StoredUser {
    const newUser: StoredUser = {
      ...userData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }
}

const mockDb = new MockDatabase();

export class AuthService {
  async register(userData: UserRegistration): Promise<AuthResponse> {
    const { name, mobile, email, password, role, businessType, address, city, state, pincode } = userData;

    // Check if user already exists
    const existingUser = mockDb.findUserByMobileOrEmail(mobile, email);
    if (existingUser) {
      throw new AppError('User already exists with this mobile or email', 409, 'USER_EXISTS');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const storedUser = mockDb.createUser({
      name,
      mobile,
      email,
      passwordHash,
      role,
      businessType,
      address,
      city,
      state,
      pincode,
      trustScore: 50,
      isActive: true
    });

    const user = this.mapStoredUserToUser(storedUser);
    const token = generateToken({ userId: user.id, role: user.role, mobile: user.mobile });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, mobile: user.mobile });

    return { user, token, refreshToken };
  }

  async login(credentials: UserLogin): Promise<AuthResponse> {
    const { mobile, password } = credentials;

    // Find user
    const storedUser = mockDb.findUserByMobile(mobile);
    if (!storedUser) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, storedUser.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const user = this.mapStoredUserToUser(storedUser);
    const token = generateToken({ userId: user.id, role: user.role, mobile: user.mobile });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, mobile: user.mobile });

    return { user, token, refreshToken };
  }

  async getUserById(userId: string): Promise<User | null> {
    const storedUser = mockDb.findUserById(userId);
    if (!storedUser) {
      return null;
    }

    return this.mapStoredUserToUser(storedUser);
  }

  private mapStoredUserToUser(storedUser: StoredUser): User {
    return {
      id: storedUser.id,
      name: storedUser.name,
      mobile: storedUser.mobile,
      email: storedUser.email,
      role: storedUser.role,
      location: {
        address: storedUser.address,
        city: storedUser.city,
        state: storedUser.state,
        pincode: storedUser.pincode,
        coordinates: {
          lat: 0,
          lng: 0
        }
      },
      businessType: storedUser.businessType,
      trustScore: storedUser.trustScore,
      isActive: storedUser.isActive,
      createdAt: storedUser.createdAt,
      updatedAt: storedUser.updatedAt
    };
  }
}