import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-this-in-production';

export interface JWTPayload {
  userId: string;
  role: 'vendor' | 'supplier';
  mobile: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload as any, JWT_SECRET, { expiresIn: '24h' } as any);
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload as any, JWT_REFRESH_SECRET, { expiresIn: '7d' } as any);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};